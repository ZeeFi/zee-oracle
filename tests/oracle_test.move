#[test_only]
module oracle::token_test {

    use oracle::tokens;
    //use std::string;

    #[test(source = @oracle)]
    public fun initialize(source : &signer) {
        tokens::intialize(source,1,b"ETH_Price");
    }

}