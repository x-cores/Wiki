
    测试环境：Ubuntu 16.04
    区块链：Ethereum 1.8
    编译器：Go 1.9.2

## 1. 下载 Ethereum 源代码

    git clone -b release/v1.8 https://github.com/ethereum/go-ethereum.git

## 2. 安装编译环境

    sudo apt-get -y install golang

或者从 https://www.golangtc.com/static/go/1.9.2/go1.9.2.linux-amd64.tar.gz 下载后手动安装，手动安装的时候需要设置 GOROOT 和 PATH

## 3. 编译 Ethereum 源代码

    cd ~/projects/go-ethereum
    make all

编译成功以后，可执行程序保存在 ~/projects/go-ethereum/build/bin 下面。

## 4. 准备创世区块的配置文件

    ~/projects/privatenet/genesis.json
    ----------------------------------------
    {
      "config": {
        "chainId": 19830403,
        "homesteadBlock": 0,
        "eip155Block": 0,
         "eip158Block": 0
      },
      "alloc": { },
      "coinbase"   : "0x0000000000000000000000000000000000000000",
      "difficulty" : "0x20000",
      "extraData"  : "",
      "gasLimit"   : "0x2fefd8",
      "nonce"      : "0x0000000019830403",
      "mixhash"    : "0x0000000000000000000000000000000000000000000000000000000000000000",
      "parentHash" : "0x0000000000000000000000000000000000000000000000000000000000000000",
      "timestamp"  : "0x00"
    }

**mixhash**：与nonce配合用于挖矿，由上一个区块的一部分生成的hash。注意他和nonce的设置需要满足以太坊的Yellow paper, 4.3.4. Block Header Validity, (44)章节所描述的条件。. 
**nonce**: nonce就是一个64位随机数，用于挖矿，注意他和mixhash的设置需要满足以太坊的Yellow paper, 4.3.4. Block Header Validity, (44)章节所描述的条件。 
**difficulty**: 设置当前区块的难度，如果难度过大，cpu挖矿就很难，这里设置较小难度 
**alloc**: 用来预置账号以及账号的以太币数量，因为私有链挖矿比较容易，所以我们不需要预置有币的账号，需要的时候自己创建即可以。 
**coinbase**: 矿工的账号，随便填 
**timestamp**: 设置创世块的时间戳 
**parentHash**: 上一个区块的hash值，因为是创世块，所以这个值是0extraData: 附加信息，随便填，可以填你的个性信息，必须为十六进制的偶位字符串 
**gasLimit**: 该值设置对GAS的消耗总量限制，用来限制区块能包含的交易信息总和，因为我们是私有链，所以填最大。

## 5. 初始化创世节点

    genesis node:
    ./geth --datadir ~/projects/data-dir/00 init ~/projects/privatenet/genesis.json
    ./geth --datadir ~/projects/data-dir/00 --networkid 19830403 --ipcdisable --port 61910 --rpcport 8200 console

    > personal.newAccount("account01")
    0xf13ad9822fa3e7bb46e54d28df4c3227c77c2c7d <- password: account01
    > personal.unlockAccount(eth.accounts[0])

    > miner.start()
    > eth.getBalance(eth.accounts[0])
    75000000000000000000

    > admin.nodeInfo.enode
    "enode://be635bb3b258217a795ccc9fa748fc8a96219e6d0b6d5ce20b5bbbf1544ab47b195f40cf406f5b56ddcba54a8503d47f46011ca245dc9d64ca353b68ced4ba6e@[::]:61910"

## 6. 初始化第二个和第三个节点

当前一共创建了三个节点，分别为 genesis node (192.168.56.101)，node01 (192.168.56.103) 和 node02 (192.168.56.104)

在第二个和第三个节点上分别运行

    node01:
    ./geth --datadir ~/projects/data-dir/01 init ~/projects/privatenet/genesis.json
    ./geth --datadir ~/projects/data-dir/01 --networkid 19830403 --ipcdisable --port 61911 --rpcport 8101 --bootnodes "enode://be635bb3b258217a795ccc9fa748fc8a96219e6d0b6d5ce20b5bbbf1544ab47b195f40cf406f5b56ddcba54a8503d47f46011ca245dc9d64ca353b68ced4ba6e@[192.168.56.101]:61910" console
    > personal.newAccount("account02")
    0x7e7f6abe59942c04c23926caa6e9d45fd2e4de1b <- password: account02
    > personal.unlockAccount(eth.accounts[0])

    node02:
    ./geth --datadir ~/projects/data-dir/02 init ~/projects/privatenet/genesis.json
    ./geth --datadir ~/projects/data-dir/02 --networkid 19830403 --ipcdisable --port 61912 --rpcport 8102 --bootnodes "enode://be635bb3b258217a795ccc9fa748fc8a96219e6d0b6d5ce20b5bbbf1544ab47b195f40cf406f5b56ddcba54a8503d47f46011ca245dc9d64ca353b68ced4ba6e@[192.168.56.101]:61910" console
    > personal.newAccount("account03")
    0xc268176732f5da43a20fb77d8a2177b1dec8e592 <- password: account03
    > personal.unlockAccount(eth.accounts[0])

## 7. 测试私链

在 node02 上运行 miner 记账

    node02:
    > miner.start()

尝试从第一个账户转账给第二个账户（这两个账号分别是在 genesis node 上创建的密码为 account01 的账号和在 node01 上创建的密码为 account02 的账号），在我们创建的第一个节点上运行

    genesis node:
    > eth.sendTransaction({from: "0xf13ad9822fa3e7bb46e54d28df4c3227c77c2c7d", to: "0x7e7f6abe59942c04c23926caa6e9d45fd2e4de1b", value: web3.toWei(1, "ether")})

等待记账完成后（即在 node02 上的 miner 创建了一个新块以后），分别查看账户的状态

    node01:
    > eth.getBalance(eth.accounts[0])
    1000000000000000000 <- 1 个 ether 转账成功


Reference:
https://blog.csdn.net/u013096666/article/details/72639906
