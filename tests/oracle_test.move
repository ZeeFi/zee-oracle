#[test_only]
module oracle::token_test {

    use oracle::tokens;
    //use std::string;

    #[test(source = @oracle)]
    public fun initialize_test(source : &signer) {
        tokens::intialize(source,1,b"ETH_Price");
    }

    #[test(source = @oracle)]
    public fun add_feed_test(source : &signer) {
        tokens::intialize(source,1,b"ETH_Price");
        tokens::add_feed(source, 180990909090, 8, b"20220817")
    }

}