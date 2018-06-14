
    测试环境：Ubuntu 16.04
    区块链：EOS DAWN-2018-02-14
    编译器：clang++

## 1. 下载 EOS 源代码

    git clone --recursive https://github.com/EOSIO/eos.git ~/Projects/eos
    git checkout DAWN-2018-02-14

如果在 git clone 的时候忘记使用参数 --recursive，可以进入到 ~/Projects/eos 中执行 `git submodule update --init --recursive` 来获取这些代码。

## 2. 编译源代码

在 ~/Projects/eos 下执行 `./build.sh ubuntu` 进行编译。这一步可能花费几个小时的时间，编译过程中编译脚本会从另外几个 github repository 中下载代码，编译完成之后，脚本会删除掉这些代码，如果想保留这些代码，可以编辑 ~/Projects/eos/scripts/install_dependencies.sh 注释掉所有执行 rm 命令的行。在 ubuntu 环境下，第三方代码会保存到 ~/opt 目录中。

编译生成的文件保存在 ~/Projects/eos/build 目录下，其中几个重要的程序如下：

* eosd - 服务器端组件，真正执行区块链命令的程序（server-side blockchain node component）
* eosc - 客户端组件，通过调用服务器端组件暴露的 HTTP API 来发送命令（command line interface to interact with the blockchain）
* eos-walletd - 钱包（EOS wallet，暂时并没有了解到这个应用程序的用途）
* launcher - 加载器（application for nodes network composing and deployment; more on launcher，暂时并没有了解到这个应用程序的用途）

在执行编译的过程中，有可能会报告找不到 clang++，在 ubuntu 中查找可以找到 clang-4.0 这个可执行程序，创建一个软链接到这个文件即可。

## 3. 测试单节点网络

1. 以下测试以 ~/Projects/eos/ 为当前目录。在 build/programs/eosd 下先执行一次 `./eosd`，这一次执行可能会出错退出，这是正常的，这次执行以后会在 build/programs/eosd 下面创建了新文件夹 data-dir 和 config-dir，config-dir 下有一个新生成的文件 config.ini，修改这个文件：

        # Load the testnet genesis state, which creates some initial block producers with the default key
        genesis-json = ~/Projects/eos/build/genesis.json
        # Enable production on a stale chain, since a single-node test chain is pretty much always stale
        enable-stale-production = true
        # Enable block production with the testnet producers
        producer-name = inita
        producer-name = initb
        producer-name = initc
        producer-name = initd
        producer-name = inite
        producer-name = initf
        producer-name = initg
        producer-name = inith
        producer-name = initi
        producer-name = initj
        producer-name = initk
        producer-name = initl
        producer-name = initm
        producer-name = initn
        producer-name = inito
        producer-name = initp
        producer-name = initq
        producer-name = initr
        producer-name = inits
        producer-name = initt
        producer-name = initu
        # Load the block producer plugin, so you can produce blocks
        plugin = eosio::producer_plugin
        # Wallet plugin
        plugin = eosio::wallet_api_plugin
        # As well as API and HTTP plugins
        plugin = eosio::chain_api_plugin
        plugin = eosio::http_plugin

2. 在 build/programs/eosd 下再次执行 `./eosd` 启动服务程序，看到类似的输出代表单节点已经正常运行：

        2604007ms            chain_controller.cpp:208      _push_block          ] initg #2624 @2018-03-23T13:43:24  | 0 trx, 0 pending, exectime_ms=1
        2604008ms            producer_plugin.cpp:246       block_production_loo ] initg generated block #2624 @ 2018-03-23T13:43:24 with 0 trxs  0 pending
        2605009ms            chain_controller.cpp:208      _push_block          ] initl #2625 @2018-03-23T13:43:25  | 0 trx, 0 pending, exectime_ms=1
        2605009ms            producer_plugin.cpp:246       block_production_loo ] initl generated block #2625 @ 2018-03-23T13:43:25 with 0 trxs  0 pending

3. 在 build/programs/eosc 下运行 `./eosc get info`，可以看到当前链的状态

## 4. 测试多节点网络

1. 在同一台物理机器上部署节点。按照官方文档中说明的使用 launcher 工具启动二三节点失败，将手动部署和运行第二个和第三个节点，查看失败日志 `tail -f ~/Projects/eos/build/tn_data_00/stderr*.txt` ：

* 找不到 genesis.json 文件，解决办法：在启动 launcher 时使用参数 `-g ~/Projects/eos/genesis.json`
* 端口冲突，解决办法：无

2. 创建两个节点各自使用的目录

        mkdir -p ~/Projects/eos/build/cluster/node01 ~/Projects/eos/build/cluster/node02
        mkdir -p ~/Projects/eos/build/cluster/node01/data-dir ~/Projects/eos/build/cluster/node02/data-dir
        mkdir -p ~/Projects/eos/build/cluster/node01/config-dir ~/Projects/eos/build/cluster/node02/config-dir
        mkdir -p ~/Projects/eos/build/cluster/node01/wallet-dir ~/Projects/eos/build/cluster/node02/wallet-dir

3. 在两个节点的 config-dir 目录下分别创建 config.ini
        node01:
        ----------------------------------------
        cd ~/Projects/eos/build/cluster/node01
        ln -s ~/Projects/eos/build/programs/eosd/eosd ./eosd
        ln -s /Users/yangyun/Projects/eos/build/programs/eosc/eosc ./eosc
        
        vi ./config-dir/config.ini
        genesis-json = /Users/yangyun/Projects/eos/genesis.json
        block-log-dir = blocks
       readonly = 0
        send-whole-blocks = true
        shared-file-dir = blockchain
        shared-file-size = 8192
        http-server-address = 127.0.0.1:8888
        p2p-listen-endpoint = 0.0.0.0:9876
        p2p-server-address = localhost:9876
        allowed-connection = any
        p2p-peer-address = localhost:9877
        required-participation = true
        private-key = ["EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV","5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3"]
        producer-name = inita
        producer-name = initc
        producer-name = inite
        producer-name = initg
        producer-name = initi
        producer-name = initk
        producer-name = initm
        producer-name = inito
        producer-name = initq
        producer-name = inits
        producer-name = initu
        plugin = eosio::producer_plugin
        plugin = eosio::chain_api_plugin
        plugin = eosio::account_history_plugin
        plugin = eosio::account_history_api_plugin
        plugin = eosio::wallet_api_plugin
        plugin = eosio::http_plugin

        ./eosc --wallet-port 8888 -p 8888 get info
    
        node02:
        ----------------------------------------
        cd ~/Projects/eos/build/cluster/node02
        ln -s ~/Projects/eos/build/programs/eosd/eosd ./eosd
        ln -s /Users/yangyun/Projects/eos/build/programs/eosc/eosc ./eosc
        
        vi ./config-dir/config.ini
        genesis-json = /Users/yangyun/Projects/eos/genesis.json
        block-log-dir = blocks
        readonly = 0
        send-whole-blocks = true
        shared-file-dir = blockchain
        shared-file-size = 8192
        http-server-address = 127.0.0.1:8889
        p2p-listen-endpoint = 0.0.0.0:9877
        p2p-server-address = localhost:9877
        allowed-connection = any
        p2p-peer-address = localhost:9876
       required-participation = true
        private-key = ["EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV","5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3"]
        producer-name = initb
        producer-name = initd
        producer-name = initf
        producer-name = inith
        producer-name = initj
        producer-name = initl
        producer-name = initn
        producer-name = initp
        producer-name = initr
        producer-name = initt
        plugin = eosio::producer_plugin
        plugin = eosio::chain_api_plugin
        plugin = eosio::account_history_plugin
        plugin = eosio::account_history_api_plugin
        plugin = eosio::wallet_api_plugin
        plugin = eosio::http_plugin

        ./eosc --wallet-port 8889 -p 8889 get info

4. 测试私链

首先在第一个节点上部署合约，然后分别在两个节点上检查合约执行的结果，两个节点上的合约执行结果是相同的，证明合约执行状态已经成功的同步到了所有的节点。（由于 EOS 具有很高的出块速度，所以可以很快的看到合约执行的结果。）

        node01:
        ----------------------------------------
        cd ~/Projects/eos/build/cluster/node01
        ./eosd --data-dir `pwd`/data-dir --config-dir `pwd`/config-dir --wallet-dir `pwd`/wallet-dir --skip-transaction-signatures --enable-stale-production
        ./eosc --wallet-port 8888 -p 8888 wallet create
        ./eosc --wallet-port 8888 -p 8888 wallet import 5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3

        -- 创建 currency 账号 --
        ./eosc --wallet-port 8888 -p 8888 create account inita currency EOS695J6ic3fjdieorByUwSc7kyZRStjcbncvVtevK1uhAozBue8A EOS7MjWtDqbZ6RHwrSk47bhcvF5PADgAyEbF4jhSkxRnaJ6PGxHs3
        ./eosc --wallet-port 8888 -p 8888 wallet import 5JJBnjKZVFeeZ7xTMcCeAbYavmZiz4stx8Ph9cVjXc3Xkqdsru8

        -- 导入 currency 合约 --
        ./eosc --wallet-port 8888 -p 8888 set contract currency ~/Projects/eos/contracts/currency/currency.wast ~/Projects/eos/contracts/currency/currency.abi

        -- 检查合约执行结果 --
        ./eosc --wallet-port 8888 -p 8888 get table currency currency account
        {
          "rows": [{
              "key": "account",
              "balance": 1000000000
            }
          ],
          "more": true
        }

        node02:
        ----------------------------------------
        cd ~/Projects/eos/build/cluster/node02
        ./eosd --data-dir `pwd`/data-dir --config-dir `pwd`/config-dir --wallet-dir `pwd`/wallet-dir --skip-transaction-signatures --enable-stale-production
        ./eosc --wallet-port 8889 -p 8889 wallet create
        ./eosc --wallet-port 8889 -p 8889 wallet import 5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3

        -- 检查由 node01 执行合约结果 --
        ./eosc --wallet-port 8889 -p 8889 get table currency currency account
        {
          "rows": [{
              "key": "account",
              "balance": 1000000000
            }
          ],
          "more": true
        }
