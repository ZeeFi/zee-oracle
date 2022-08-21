#[test_only]
module oracle::token_test {

    use oracle::tokens;
    //use std::string;
    use std::debug;
    use std::string;

    #[test(source = @oracle)]
    public fun initialize_test(source : &signer) {
        tokens::initialize(source,1,b"ETH_Price");
    }

    #[test(source = @oracle)]
    public fun add_feed_test(source : &signer) {
        tokens::initialize(source,1,b"ETH_Price");
        tokens::add_feed(source, 180990909090, 8, b"20220817")
    }


        #[test(source = @oracle)]
    public fun get_feed_test(source : &signer) {
        tokens::initialize(source,1,b"ETH_Price");
        tokens::add_feed(source, 180990909090, 8, b"20220817");
        let (price ,decimals, last_update ) = tokens::get_feed();

        assert!(price == 180990909090, 1);
        assert!(decimals == 8, 1);
        assert!(last_update == string::utf8(b"20220817") , 1);

        // let length = tokens::get_feed();

         debug::print(&price);

        
    }

}