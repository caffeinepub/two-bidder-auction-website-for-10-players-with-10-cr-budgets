import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Migration "migration";

(with migration = Migration.run)
actor {
  public type PlayerState = {
    name : Text;
    price : ?Nat;
    boughtBy : ?Text;
  };

  public type BidderState = {
    name : Text;
    remainingAmount : Nat;
    isPlaying : Bool;
  };

  public type AuctionState = {
    players : [PlayerState];
    winners : [PlayerState];
    bidders : [BidderState];
    currentAuctionedPlayer : ?Text;
    inProgress : Bool;
    highestBid : Nat;
    highestBidder : ?Text;
    roundStartTime : Int;
  };

  public type AuctionBid = {
    amount : Nat;
    bidderName : Text;
    playerName : Text;
    limitExceedingAmount : ?Nat;
  };

  public type RoundBidResult = {
    bid : AuctionBid;
    state : AuctionState;
  };

  public type AudienceLimit = {
    status : Text;
    currentCount : Nat;
    maxCapacity : Nat;
    message : Text;
  };

  type PlayerCategory = {
    name : Text;
    price : ?Nat;
    boughtBy : ?Text;
  };

  var secretKey : ?Text = null;

  var auctionState = {
    players = [] : [PlayerState];
    winners = [] : [PlayerState];
    bidders = [] : [BidderState];
    currentAuctionedPlayer = null;
    inProgress = false;
    highestBid = 0;
    highestBidder = null;
    roundStartTime = 0;
  } : AuctionState;

  let maxBudget = 1_000; // In rupees (1 CR = 100 rupees)
  let maxAudienceSize = 13;
  var currentAudienceCount = 0;
  var isAuctionActive = false;

  public query ({ caller }) func checkAudienceCapacity() : async AudienceLimit {
    if (currentAudienceCount >= maxAudienceSize and isAuctionActive) {
      {
        status = "full";
        currentCount = currentAudienceCount;
        maxCapacity = maxAudienceSize;
        message = "Audience is at full capacity. You cannot join at this moment.";
      };
    } else if (not isAuctionActive) {
      {
        status = "waiting";
        currentCount = currentAudienceCount;
        maxCapacity = maxAudienceSize;
        message = "The auction hasn't started yet.";
      };
    } else {
      {
        status = "open";
        currentCount = currentAudienceCount;
        maxCapacity = maxAudienceSize;
        message = "You can join the audience!";
      };
    };
  };

  public shared ({ caller }) func joinAudience() : async Bool {
    switch (isAuctionActive, currentAudienceCount >= maxAudienceSize) {
      case (false, false) { Runtime.trap("Auction not started") };
      case (true, true) { Runtime.trap("Audience is at maximum capacity") };
      case (true, false) {
        if (currentAudienceCount < maxAudienceSize) {
          currentAudienceCount += 1;
          return true;
        };
      };
      case (false, true) { Runtime.trap("Auction not started & full audience?") };
    };
    false;
  };

  public shared ({ caller }) func leaveAudience() : async Bool {
    if (currentAudienceCount > 0) {
      currentAudienceCount -= 1;
      true;
    } else { false };
  };

  public shared ({ caller }) func startNewAuctionWithSecretKey(
    bidder1Name : Text,
    bidder2Name : Text,
    playerNames : [Text],
    newSecretKey : Text,
  ) : async AuctionState {
    if (playerNames.size() != 10) {
      Runtime.trap("Must have exactly 10 players");
    };

    let playersMap = playerNames.map(func(p) { { name = p; price = null; boughtBy = null } });

    auctionState := {
      players = playersMap;
      winners = [];
      bidders = [
        { name = bidder1Name; remainingAmount = maxBudget; isPlaying = true },
        { name = bidder2Name; remainingAmount = maxBudget; isPlaying = true },
      ];
      currentAuctionedPlayer = null;
      inProgress = true;
      highestBid = 0;
      highestBidder = null;
      roundStartTime = 0;
    };
    secretKey := ?newSecretKey;
    isAuctionActive := true;
    auctionState;
  };

  public query ({ caller }) func getAuctionState() : async AuctionState {
    auctionState;
  };

  func getRemainingAmount(bidderName : Text) : Nat {
    switch (auctionState.bidders.find(func(bidder) { bidder.name == bidderName })) {
      case (?bidder) { bidder.remainingAmount };
      case (null) { 0 };
    };
  };

  func getLimitExceedingAmount(bid : AuctionBid) : ?Nat {
    let remainingAmount = getRemainingAmount(bid.bidderName);

    if (bid.amount > remainingAmount) {
      ?(bid.amount - remainingAmount);
    } else {
      null;
    };
  };

  func updateBidderAmount(name : Text, price : Nat) {
    let updatedBiddersList = auctionState.bidders.map(
      func(bidder) {
        if (bidder.name == name) {
          let newAmount = bidder.remainingAmount - price;
          { bidder with remainingAmount = newAmount };
        } else {
          bidder;
        };
      }
    );
    auctionState := { auctionState with bidders = updatedBiddersList };
  };

  func updatePlayerAsSold(name : Text, price : Nat, buyer : Text) {
    let soldPlayer = ?{
      name;
      price = ?price;
      boughtBy = ?buyer;
    };

    let updatedPlayersList = auctionState.players.map(
      func(player) {
        if (player.name == name and player.boughtBy == null) {
          switch (soldPlayer) {
            case (?sold) { sold };
            case (null) { player };
          };
        } else { player };
      }
    );

    auctionState := { auctionState with players = updatedPlayersList };
  };

  func addToWinners(player : PlayerState) {
    let updatedWinnersList = auctionState.winners.concat([player]);
    auctionState := { auctionState with winners = updatedWinnersList };
  };

  func endAuctionRound(player : Text) {
    auctionState := {
      auctionState with
      currentAuctionedPlayer = ?player;
      roundStartTime = Time.now();
      highestBid = 0;
      highestBidder = null;
    };
  };

  public shared ({ caller }) func startAuction(_playerName : Text) : async AuctionState {
    if (auctionState.currentAuctionedPlayer != null) {
      Runtime.trap("Auction is in progress for another player");
    };

    endAuctionRound(_playerName);
    auctionState;
  };

  public shared ({ caller }) func bidPlayer(bid : AuctionBid, providedKey : Text) : async RoundBidResult {
    switch (secretKey) {
      case (null) { Runtime.trap("Auction not started") };
      case (?key) {
        if (not Text.equal(key, providedKey)) {
          Runtime.trap("Incorrect provided key. Please check with the auctioneer");
        };
      };
    };

    switch (auctionState.currentAuctionedPlayer) {
      case (null) {
        Runtime.trap("There is no running auction for any player");
      };
      case (?playerName) {
        if (not isValidBidder(bid.bidderName)) {
          Runtime.trap("The selected bidder is not part of this auction");
        };

        checkItemSellability(bid);
        let limitExceedingAmount = getLimitExceedingAmount(bid);
        checkValidBid(bid, playerName);
        auctionState := {
          auctionState with
          highestBid = bid.amount;
          highestBidder = ?bid.bidderName;
        };
        {
          bid = { bid with limitExceedingAmount };
          state = auctionState;
        };
      };
    };
  };

  func isValidBidder(bidderName : Text) : Bool {
    auctionState.bidders.any(func(bidder) { bidder.name == bidderName });
  };

  public shared ({ caller }) func sellPlayer(_playerName : Text) : async AuctionState {
    switch (
      auctionState.currentAuctionedPlayer,
      auctionState.highestBid,
      auctionState.highestBidder
    ) {
      case (null, _, _) {
        Runtime.trap("No auctions are currently active");
      };
      case (_, 0, _) {
        Runtime.trap("You need to place at least one valid bid to auction the player");
      };
      case (?_, _, null) {
        Runtime.trap("Internal error: No highest bidder found after bidding");
      };
      case (?playerName, price, ?buyer) {
        if (playerName != _playerName) {
          Runtime.trap("Auction round for this player is not currently running");
        };

        updateBidderAmount(buyer, price);
        updatePlayerAsSold(playerName, price, buyer);
        addToWinners({
          name = playerName;
          price = ?price;
          boughtBy = ?buyer;
        });

        auctionState := {
          auctionState with
          currentAuctionedPlayer = null;
          highestBid = 0;
          highestBidder = null;
        };
        auctionState;
      };
    };
  };

  func checkItemSellability(bid : AuctionBid) {
    let isAvailable = auctionState.players.any(
      func(player) { player.name == bid.playerName and player.boughtBy == null }
    );
    if (not isAvailable) { Runtime.trap("Player has already moved") };
  };

  func checkValidBid(bid : AuctionBid, currentAuctionedPlayer : Text) {
    let noOfferRunning = not auctionState.players.any(
      func(player) { player.name == bid.playerName and player.boughtBy == null }
    );
    let priceTooLow = bid.amount <= auctionState.highestBid;
    let playerUnknown = not Text.equal(bid.playerName, currentAuctionedPlayer);
    let balanceExceeded = getLimitExceedingAmount(bid) != null;

    if (noOfferRunning) {
      Runtime.trap("Player has already moved");
    } else if (priceTooLow) {
      Runtime.trap("Bid must be greater than the current bid");
    } else if (playerUnknown) {
      Runtime.trap("Bid was found for an unexpected player");
    } else if (balanceExceeded) {
      Runtime.trap("Bid is higher than your available funds");
    };
  };
};
