module oracle::tokens{

    use std::vector;
    use oracle::config;

    use std::error;
    use std::signer;
    //use std::debug;
    use std::string;


    const ENOT_INITIALZIED : u64 = 1;
    const ENOT_AUTHORIZED : u64 = 2;
    const EALREADY_INITIALIZED :u64 = 3;

    struct Aggregator has key {
        id : u8,
        name : string::String,
        symbol : string::String,
        token_details_list :  vector<TokenDetails>
    } 

    struct TokenDetails has store, copy {
        price : u128,
        decimals : u8,
        last_update : string::String,


    }


    //struct Last
    fun initialize_(sender : &signer, id : u8, name : vector<u8>, symbol : vector<u8> ) {
        let admin_addr = config::ADMIN_ADDRESS();

        assert!(admin_addr == signer::address_of(sender), error::permission_denied(ENOT_AUTHORIZED));
        assert!(!exists<Aggregator>(admin_addr), error::already_exists(EALREADY_INITIALIZED));

        move_to (sender, Aggregator {
            id : id,
            name : string::utf8(name),
            symbol : string::utf8(symbol),
            token_details_list : vector::empty()
        });
    }


    #[cmd]
    public entry fun initialize(sender : &signer, id : u8, name : vector<u8>, symbol : vector<u8>) {
        initialize_(sender, id, name, symbol);
    }


    
    fun add_feed_(sender : &signer, price : u128, decimals : u8, last_update : vector<u8>) acquires Aggregator{
        let admin_addr = config::ADMIN_ADDRESS();

        assert!(admin_addr == signer::address_of(sender), error::permission_denied(ENOT_AUTHORIZED));
        assert!(exists<Aggregator>(admin_addr), error::not_found(ENOT_INITIALZIED));

        let aggregator = borrow_global_mut<Aggregator>(admin_addr);

        let token_details = TokenDetails {
            price : price, 
            decimals : decimals,
            last_update : string::utf8(last_update)
        };

        let token_details_list = &mut aggregator.token_details_list;
        vector::push_back<TokenDetails>(token_details_list, token_details);
    }

    #[cmd]
    public entry fun add_feed(sender : &signer, price : u128, decimals : u8, last_update : vector<u8>) acquires Aggregator {
        add_feed_(sender, price , decimals, last_update );
    }


     #[cmd]
    public entry fun add_feed_general( price : u128, decimals : u8, last_update : vector<u8>) acquires Aggregator {
        let admin_addr = config::ADMIN_ADDRESS();

        assert!(exists<Aggregator>(admin_addr), error::not_found(ENOT_INITIALZIED));

        let aggregator = borrow_global_mut<Aggregator>(admin_addr);

        let token_details = TokenDetails {
            price : price, 
            decimals : decimals,
            last_update : string::utf8(last_update)
        };

        let token_details_list = &mut aggregator.token_details_list;
        vector::push_back<TokenDetails>(token_details_list, token_details);    }

    #[cmd]
    public entry fun get_feed() : (u128, u8, string::String) acquires  Aggregator {
        let admin_addr = config::ADMIN_ADDRESS();


        assert!(exists<Aggregator>(admin_addr), error::not_found(ENOT_INITIALZIED));
        let aggregator = borrow_global<Aggregator>(admin_addr);

        let token_details_list  = &aggregator.token_details_list;

        
        let length = vector::length(token_details_list);

        if(length > 0) {
           let token_details =  vector::borrow<TokenDetails>(token_details_list, length-1);

           (token_details.price, token_details.decimals, token_details.last_update)

        } else {
             (0 , 0,  string::utf8(b"0"))
        }
    }



    // #[method]
    // public fun get_feed() : u64 acquires  Aggregator {
    //     let admin_addr = config::ADMIN_ADDRESS();


    //     assert!(exists<Aggregator>(admin_addr), error::not_found(ENOT_INITIALZIED));
    //     let aggregator = borrow_global<Aggregator>(admin_addr);

    //     let token_details_list  = &aggregator.token_details_list;

        
    //     vector::length(token_details_list) 

        
    // }

}