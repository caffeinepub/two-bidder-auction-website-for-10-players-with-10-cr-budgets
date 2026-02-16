module {
  type OldActor = {};
  type NewActor = {
    currentAudienceCount : Nat;
    maxAudienceSize : Nat;
    isAuctionActive : Bool;
  };

  public func run(_old : OldActor) : NewActor {
    {
      currentAudienceCount = 0;
      maxAudienceSize = 13;
      isAuctionActive = false;
    };
  };
};
