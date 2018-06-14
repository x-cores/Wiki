#  1. 什么是 EOS

EOS (Enterprise Operation System) 为商用分布式应用设计的一款区块链操作系统。EOS.IO 软件引入一种新的区块链架构设计，它使得去中心化的应用可以横向和纵向的扩展。 这通过构建一个仿操作系统的方式来实现，在它之上可以构建应用程序。 该软件提供帐户、身份验证、数据库、异步通信和跨越数百个 CPU 内核或集群的应用程序调度。 由此产生的技术是一种区块链架构，它可以扩展至每秒处理百万级交易，消除用户的手续费，并且允许快速和轻松的部署去中心化的应用。

区块链应用最大的限制就是延迟和数据吞吐量，EOS通过并行链和DPOS的方式解决了延迟和数据吞吐量的难题，比如BTC是大概最少三十分钟后数据才能被确认，7TPS/S，ETH也需要几分钟，只有，但基于石墨烯底层的BTS和STEEM却可以达到1.5S的平均确认速度和有限条件下实测3300TPS的数据吞吐量，EOS通过并行链的方式，最高可以达到数百万TPS，并且并行本地链甚至可以达到毫秒级的确认速度。

EOS和ETH的愿景大致相似，一个操作系统的底层，在这个操作系统里，可以构建各种各样的智能合约应用，并且又因为并行链而使得EOS系统里的每一个软件都可以获得高性能支撑。类似BTS STEEM这种每日交易次数超过BTC和ETH的真正意义上的应用，只有EOS上可以构建。

#  2. 数据层(存储层)

参考代码：

    libraries/chainbase (memory database)
    plugins/database_plugin
    plugins/db_plugin (data mirror in mongodb)

* **libraries/chainbase**

数据存储的实现，默认创建 data-dir 目录，目录中使用 shared_memory 将内存映射到文件，然后通过 boost::interprocess::managed_mapped_file::segment_manager 对内存进行管理，所有的 block 都将暂存在这里。

* **block（区块）**

那么，block 是由什么组成的？

block（区块）> cycle（周期，串行）> thread（线程，并行）> transaction（交易，串行）> message（消息，串行）> account（账户，并行）

参考代码：

    libraries/chain/include/eos/chain/block.hpp

    block:
    ----------------------------------------
    block_id_type                   previous;（上一个区块的哈希值）
    fc::time_point_sec              timestamp;（产生区块的时间）
    checksum_type                   transaction_merkle_root;（块中所有交易的 checksum 值，为该区块内所有交易的 merkle 根，用于快速验证交易的完整性。）
    account_name                    producer;（区块生产者）
    round_changes                   producer_changes;（生产者变更记录）
    signature_type                  producer_signature;（该区块的生产者对该区块的签名）
    vector<cycle>                   cycles;（周期，见下面）

* **cycle（周期）**

EOS 为了提升消息交互的效率，使得两个账户(合约)能够在单个区块内来回交换消息(交易)，而不必在每个消息之间等待 3 秒（出块时间），在 block 中设计了 cycle 结构来实现了一条“小链”。在产生区块的时间内，每个交易记录都会进入到 cycle 中，例如 A 发给 B 的消息在 cycles[1]中处理，B 返回的消息就可以在后续的 cycles[4]中进行处理。区块生成器将不断把 cycle 添加到区块中，直到最长的区块时间间隔达到，或者没有新的可传送交易生成。在 cycle 内部，EOS 设计了 thread 来实现消息、交易的快速并行处理。Thread 在节点内可以被并行处理，需要注意的是，涉及到同一个账户的交易，只能被放到同一个 thread 中，这样不会出现同一个账户的状态不一致的情况。

    cycle:
    ----------------------------------------
    using cycle = vector<thread>;

    thread:
    ----------------------------------------
    vector<processed_generated_transaction> generated_input;（由区块链生成的交易）
    vector<processed_transaction>           user_input;（由区块生成者处理完用户发出的交易）

* **transaction（交易）**

EOS 中主要使用三种 transaction 结构。其中 SignedTransaction 是由用户发出的交易请求，ProcessedTransaction 是由区块生成者处理完用户发出的交易请求后生成的交易实体，GeneratedTransaction 是由区块链生成的交易请求，特别的是由智能合约生成的交易请求。

    libraries/chain/include/eos/chain/transaction.hpp

    signed_transaction (transaction):
    ----------------------------------------
    vector<signature>               signatures;（账户对每一个消息的签名）
    uint16                          ref_block_num;（上一个可追溯的包含该交易签名者的区块）
    uint32                          ref_block_prefix;（上一个可追溯块 hash 的前 4 个字节）
    vector<account_name>            scope;
    vector<account_name>            read_scope;
    vector<message>                 messages;（该交易的内容）

    generated_transaction (transaction):
    ----------------------------------------
    generated_transaction_id_type   id;
    uint16                          ref_block_num;（上一个可追溯的包含该交易签名者的区块）
    uint32                          ref_block_prefix;（上一个可追溯块 hash 的前 4 个字节）
    vector<account_name>            scope;
    vector<account_name>            read_scope;
    vector<message>                 messages;（该交易的内容）

    processed_transaction (signed_transaction:signed_transaction:transaction):
    ----------------------------------------
    vector<message_output>          output;
    vector<signature>               signatures;（账户对每一个消息的签名）
    uint16                          ref_block_num;（上一个可追溯的包含该交易签名者的区块）
    uint32                          ref_block_prefix;（上一个可追溯块 hash 的前 4 个字节）
    vector<account_name>            scope;
    vector<account_name>            read_scope;
    vector<message>                 messages;（该交易的内容）

1. GeneratedTransaction

因为这个交易是由智能合约产生的，它可以用于 EOS 上不同应用间的通信。但又是因为它由智能合约产生，因此它并不含有签名，所以它的验证必须要连同触发产生该交易的智能合约的交易一同被验证。

2. SignedTransaction

SignedTransaction 是由用户发出的交易请求，在 Transaction 的基础上增加了账户对事务的签名列表。注意这里使用了向量保存签名而不是单个签名，因为向量中保存的是账户对该交易中的每一条消息的每一个签名。

3. ProcessedTransaction

ProcessedTransaction 是由区块生成者处理完用户发出的交易请求后生成的交易实体，在 Transaction 基础上增加了 message_output 用于记录对账户发出的 SignedTransaction 处理后的输出，这个输出可以包含若干条生成的相关交易 GeneratedTransaction。

4. Message

Transaction 包含的 Message 向量保存的是交易的实际内容，只有当同一个交易中所有的消息都被接受的时候，交易本身才能够被确认，任何一个消息被拒绝都会导致整个交易的失败。由于交易是在 Thread 中处理的，所以同一个 Thread 下的交易是串行处理的，那么同一个交易下面的消息也是被串行处理的。如果同一个用户在给两个不同的用户转账的时候，最好的处理方式是生成多个交易，这样多个交易可能在多个 Thread 中，那么这些交易就有可能被并行处理，从而提高处理交易的性能。

_（疑问：最后一个句话是从其他的资料中转载过来的，根据之前描述的另外一个原则，涉及同一账户的多笔交易会放在同一个 Thread 中处理，那么如最后一句所言，一个账户向多个账户转账同样会被分配到同一个 Thread 中串行处理，即使把消息分拆成多个交易也无法提高交易的性能？）_

    libraries/types/include/eos/types/generated.hpp

    message:
    ----------------------------------------
    account_name                     code;（智能合约名称）
    func_name                        type;（智能合约中的方法名）
    vector<account_permission>       authorization;（处理该消息需要使用的权限：owner, active 和 recovery）
    bytes                            data;（消息内容）

* **permission（权限）**

1. owner：可以做所有的事情
2. active: 可以做除了 “更改所有者” 以外的所有事情
3. recovery: 恢复账户的账户控制（?）

#  3. 网络层
##  3.1. P2P Network
#  4. 共识层
##  4.1. POW(proof of work)
##  4.2. POO(proof of own)
##  4.3. 拜占庭算法
#  5. 激励层
#  6. 智能合约

智能合约程序不仅仅只是一个可以自动执行的计算机程序，它更像是一个系统的参与者，可以把它想象成一个绝对可信的人，他负责临时保管你的资产，并且严格按照事先商定好的规则执行操作。EOS 宣称支持 EVM 和 WASM（WebAssembly）两种沙盒，目前在代码中可以看到 EOS 选用了 WASM 作为标准的实现。_（据说 WASM 的运行效率比 EVM 高很多）_

### 智能合约的工作原理

基于区块链的智能合约包括事务处理和保存的机制，以及一个完备的状态机，用于接受和处理各种智能合约；并且事务的保存和状态处理都在区块链上完成。

智能合约的触发需要满足时间描述信息中的触发条件，当条件满足以后，从智能合约自动发出预设的数据资源。智能合约系统的核心在于进入智能合约的是一组事务和事件，经过智能合约处理后，出来的也是一组事务和事件。它的存在只是为了让一组复杂的、带有触发条件的数字化承诺能够按照参与者的意志，正确执行。

### 智能合约的构建及执行步骤

基于区块链的智能合约的构建及执行分为如下步骤：

1. 智能合约的构建：由区块链内的多个用户共同参与制定一份智能合约；
2. 智能合约的存储：智能合约通过P2P网络扩散到每个节点，并存入区块链；
3. 智能合约的执行：智能合约定期进行自动机状态检查，将满足条件的事务进行验证，达成共识后自动执行并通知用户。

合约中包含了数据和逻辑实现代码，数据是通过一个 table 类型的数据结构进行保存的，以下说明 table 和逻辑实现代码的实现：

* **table**

合约通过调用 db 接口来实现数据的存取。

Scope（保存数据的账户）-> Code（执行写操作的账户）-> Table（表名）-> Record（行）-> PrimaryType（主键类型）-> SecondaryType（副键类型）

参考代码：

    contracts/eoslib/db.hpp
    ----------------------------------------
    scope - the default account name/scope that this table is located within
    code - the code account name which has write permission to this table
    table - a unique identifier (name) for this table
    Record - the type of data stored in each row
    PrimaryType - the type of the first field stored in Record
    SecondaryType - the type of the second field stored in Record

Primary 和 Secondary 索引是 N-bits 的无符号整型，索引是按照从小到大的顺序排列保存。

以 contract 中的 currency contract 为例，参考代码：

    contracts/currency/currency.hpp
    ----------------------------------------
    using accounts = eosio::table<N(defaultscope),N(currency),N(account),account,uint64_t>;

    contracts/eoslib/types.hpp
    ----------------------------------------
    #define N(X) ::eosio::string_to_name(#X) <- X 是 base32 编码的字符串，这里将字符串转换成了对应的 uint64_t 值
    
* **implementation**

    extern "C" {
        void init();
        void apply( uint64_t code, uint64_t action );
    }

init() 函数是在代码第一次加载的时候立即执行的，这段代码只会被执行一次，一般用来初始化状态。在 currency 这个合约中，init() 函数为拥有者账户分配了 1 亿代币。
apply(code, action) 函数相当于传统的 main 函数作为执行合约的入口，例如在 currency 这个合约中，apply(code, action) 函数处理了当 code 为 currency 这个合约且 action 为 transfer 这个事件。

* **发布**

        开始之前可能需要执行：
        mkdir ~/Projects/eos/build/install
        ln -s ~/Projects/eos/contracts ~/Projects/eos/build/install/share

用户发行合约要按照以下步骤进行：

1. 在 build/tools 目录下，执行 `./eoscpp -n test_contract` 创建合约

        生成文件：    
        test_contract.abi（Application Binary Interface (ABI)是一个基于 JSON 的描述文件，用来转换 JSON 和二进制格式的用户消息）
        test_contract.cpp（cpp 文件是包含合约功能的源文件）
        test_contract.hpp（hpp 是包含 cpp 文件所引用的变量、常量、函数的头文件）

2. 在生成的源代码文件上开发合约（后面会讲一个合约的例子）
3. 在 build/tools 目录下，执行 `./eoscpp -o test_contract/test_contract.wast test_contract/test_contract.cpp` 生成 wast 文件（WASM 文件）
4. 在 build/programs/eosc 目录下，执行 `./eosc set contract test_contract ../tools/test_contract/test_contract.wast ../tools/test_contract/test_contract.abi` 部署合约
5. 在 build/programs/eosc 目录下，执行 `./eosc push message [合约账户] [方法名称] [消息] --scope [账户A],[账户B] --permission [账户A] @ active` 执行合约
6. 在 build/programs/eosc 目录下，执行 `./eosc get table [账户A] [合约账户] [表名]` 查看执行结果

#  7. DAPP

DAPP（decentralized application）就是我们所说的去中心化应用，传统 APP 是由独立的个人或者公司开发的，运行在传统的互联网上，由开发者进行维护和升级，数据通常是保存在开发者所有的服务器中。相比较传统的 APP 来说，DAPP 一般并不是由独立的个人或企业开发，而且应用也是运行在去中心化的网络上，如 Ethereum，EOS 等等。DAPP 的数据不会因为人为或者非人为的因素丢失或破坏。

DAPP 有以下几个特点：
1. 开源和社区维护
2. 使用区块链来保存数据
3. 使用代币来保存值 _（Use a cryptographic token to store value）_
4. 代币是由加密算法生成的 _（Generate these tokens through a cryptographic algorithm）_

