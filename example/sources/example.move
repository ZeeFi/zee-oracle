module example::oracle{

    use zee_oracle::tokens;
    use std::debug;
    use aptos_framework::string::String;

    public fun get_token_price(token_symbol : vector<u8>) {

        let (price, decimal, last_update) = tokens::get_feed(token_symbol);
        debug::print<u128>(&price);
        debug::print<u8>(&decimal);
        debug::print<String>(&last_update);

    }



    #[test()]
    public fun get_token_price_test() {
        get_token_price(b"ETH");
    }
}