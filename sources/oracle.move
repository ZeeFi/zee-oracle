module oracle::tokens{

    use std::vector;
    use oracle::config;

    use std::error;
    use std::signer;


    const ENOT_INITIALZIED : u64 = 1;
    const ENOT_AUTHORIZED : u64 = 2;
    const EALREADY_INITIALIZED :u64 = 3;

    struct Aggregator has key {
        id : u8,
        name : vector<u8>,
        token_details_list :  vector<TokenDetails>
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
        assert!(!exists<Aggregator>(admin_addr), error::already_exists(EALREADY_INITIALIZED));

        move_to (sender, Aggregator {
            id : id,
            name : name ,
            token_details_list : vector::empty()
        });

    }

    public fun intialize(sender : &signer, id : u8, name : vector<u8>) {
        initialize_(sender, id, name);
    }


    
    fun add_feed_(sender : &signer, price : u128, decimals : u8, last_update : vector<u8>) acquires Aggregator{
        let admin_addr = config::ADMIN_ADDRESS();

        assert!(admin_addr == signer::address_of(sender), error::permission_denied(ENOT_AUTHORIZED));
        assert!(exists<Aggregator>(admin_addr), error::not_found(ENOT_INITIALZIED));

        let aggregator = borrow_global_mut<Aggregator>(admin_addr);

        let token_details = TokenDetails {
            price : price, 
            decimals : decimals,
            last_update : last_update
        };

        let token_details_list = &mut aggregator.token_details_list;
        vector::push_back<TokenDetails>(token_details_list, token_details);
    }

    #[cmd]
    public fun add_feed(sender : &signer, price : u128, decimals : u8, last_update : vector<u8>) acquires Aggregator {
        add_feed_(sender, price , decimals, last_update );
    }

    

}