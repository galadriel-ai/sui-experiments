module my_first_package::my_module {

    // Part 1: Imports
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    // Part 2: Struct definitions
    struct Sword has key, store {
        id: UID,
        magic: u64,
        strength: u64,
    }

    struct Forge has key, store {
        id: UID,
        swords_created: u64,
    }

    // Part 3: Module initializer to be executed when this module is published
    fun init(ctx: &mut TxContext) {
        let admin = Forge {
            id: object::new(ctx),
            swords_created: 0,
        };
        // Transfer the forge object to the module/package publisher
        transfer::transfer(admin, tx_context::sender(ctx));
    }

    // Part 4: Accessors required to read the struct attributes
    public fun magic(self: &Sword): u64 {
        self.magic
    }

    public fun strength(self: &Sword): u64 {
        self.strength
    }

    public fun swords_created(self: &Forge): u64 {
        self.swords_created
    }

    public fun sword_create(
        forge: &mut Forge,
        magic: u64,
        strength: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        use sui::transfer;
        forge.swords_created = forge.swords_created + 1;

        // create a sword
        let sword = Sword {
            id: object::new(ctx),
            magic: magic,
            strength: strength,
        };
        // transfer the sword
        transfer::transfer(sword, recipient);
    }

    public fun sword_transfer(sword: Sword, recipient: address, _ctx: &mut TxContext) {
        use sui::transfer;
        // transfer the sword
        transfer::transfer(sword, recipient);
    }

    // Part 6: Private functions (if any)

    #[test_only] use sui::test_scenario as ts;

    #[test_only] const ADMIN: address = @0xAD;
    #[test_only] const ALICE: address = @0xA;
    #[test_only] const BOB: address = @0xB;

    #[test]
    public fun test_module_init() {
        let ts = ts::begin(@0x0);

        // first transaction to emulate module initialization.
        {
            ts::next_tx(&mut ts, ADMIN);
            init(ts::ctx(&mut ts));
        };

        // second transaction to check if the forge has been created
        // and has initial value of zero swords created
        {
            ts::next_tx(&mut ts, ADMIN);
            // extract the Forge object
            let forge: Forge = ts::take_from_sender(&ts);

            // verify number of created swords
            assert!(swords_created(&forge) == 0, 1);

            // return the Forge object to the object pool
            ts::return_to_sender(&mut ts, forge);
        };

        ts::end(ts);
    }
}

