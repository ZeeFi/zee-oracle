module oracle::tokens{

    use std::vector;
    use oracle::config;

    use std::error;
    use std::signer;


    const ENOT_INITIALZIED : u64 = 1;
    const ENOT_AUTHORIZED : u64 = 2;

    struct Aggregator has key {
        id : u8,
        name : vector<u8>,
        token_details :  vector<TokenDetails>
    } 

    struct TokenDetails has store {
        price : u128,
        decimals : u8,
        last_update : vector<u8>,
    }


    //struct Last


    fun initialize_(sender : &signer, id : u8, name : vector<u8> ) {
        let admin_addr = config::ADMIN_ADDRESS();

        assert!(admin_addr == signer::address_of(sender), error::permission_denied(ENOT_AUTHORIZED));
        assert!(!exists<Aggregator>(admin_addr), error::not_found(ENOT_INITIALZIED));

        move_to (sender, Aggregator {
            id : id,
            name : name ,
            token_details : vector::empty()
        });

    }

    public fun intialize(sender : &signer, id : u8, name : vector<u8>) {
        initialize_(sender, id, name);
    }

    

}