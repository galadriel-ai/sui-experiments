module agent::agent {

    // Part 1: Imports
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::table::{Table, Self};
    use std::string::{Self, String};


    struct Prompts has key, store {
        id: sui::object::UID,
        prompts: Table<u32, String>
    }

    struct Responses has key, store {
        id: sui::object::UID,
        responses: Table<u32, String>
    }

    struct FunctionCalls has key, store {
        id: sui::object::UID,
        function_calls: Table<u32, String>
    }

    struct FunctionResults has key, store {
        id: sui::object::UID,
        function_results: Table<u32, String>
    }

    struct AgentRun has key, store {
        id: UID,
        query: String,
        responses: Responses,
        function_calls: FunctionCalls,
        function_results: FunctionResults,
        is_finished: bool,
        prompt: u32
    }

    // Part 3: Module initializer to be executed when this module is published
    fun init(ctx: &mut TxContext) {
        let prompts = Prompts {
            id: object::new(ctx),
            prompts: table::new<u32, String>(ctx)
        };
        // Transfer the forge object to the module/package publisher
        transfer::transfer(prompts, tx_context::sender(ctx));
    }


    public fun addPrompt(
        table: &mut Prompts,
        k: u32,
        v: String
    ) {
        table::add(
            &mut table.prompts,
            k,
            v
        );
    }

    public fun getPrompt(
        table: &mut Prompts,
        k: u32
    ) {
        table::borrow(
            &mut table.prompts,
            k
        );
    }

    public fun runAgent(
        promptId: u32,
        query: String,
        ctx: &mut TxContext
    ) {
        // create a sword
        let agentRun = AgentRun {
            id: object::new(ctx),
            query: query,
            responses: Responses {
                id: object::new(ctx),
                responses: table::new<u32, String>(ctx)
            },
            function_calls: FunctionCalls {
                id: object::new(ctx),
                function_calls: table::new<u32, String>(ctx)
            },
            function_results: FunctionResults {
                id: object::new(ctx),
                function_results: table::new<u32, String>(ctx)
            },
            is_finished: false,
            prompt: promptId
        };
        // transfer the sword
        transfer::transfer(agentRun, tx_context::sender(ctx));
    }

    public fun addResponse(
        table: &mut Responses,
        k: u32,
        v: String
    ) {
        table::add(
            &mut table.responses,
            k,
            v
        );
    }

    public fun addOne(
        nr: u32
    ): u32 {
        nr + 1u32
    }
}