module dictionary_contract::dictionary {

    // Part 1: Imports
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::dynamic_object_field as ofield;

    struct Dictionary has key, store {
        id: UID,
    }

    struct DictionaryValue has key, store {
        id: UID,
        value: String
    }

    // Part 3: Module initializer to be executed when this module is published
    fun init(ctx: &mut TxContext) {
        let dict = Dictionary {
            id: object::new(ctx)
        };
        transfer::transfer(dict, tx_context::sender(ctx));
    }


    public fun addToDictionary(
        dictionary: &mut Dictionary,
        k: String,
        v: String,
        ctx: &mut TxContext
    ) {
        ofield::add(&mut dictionary.id, k, DictionaryValue {
            id: object::new(ctx),
            value: v
        });
    }
}