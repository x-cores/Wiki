#  1. 什么是 Spark

Spark（2009 年）是基于**内存**计算的大数据**并行**计算框架。与其他计算方案相比最大的特点是性能提升。Spark 是 MapReduce 的替代方案，而且兼容 HDFS、Hive 等分布式存储层。Spark 将执行模型抽象成通用的有向无环图执行计划（DAG），这可以将多 Stage 的任务串联或者并行执行，而无须将 Stage 中间结果输出到 HDFS 中。Spark 能控制数据在不同节点上的分区，用户可以自定义分区策略。Spark 支持基于 Hash 的分布式聚合，调度中采用更为通用的任务执行计划图（DAG），每一轮的输出结果在内存中缓存。Spark 采用了事件驱动的类库 AKKA 来启动任务，通过线程池复用来避免进程启动和切换开销。

# 2. 学习 Spark 代码

## 1. Spark 代码结构

[Spark@GitHub](https://github.com/apache/spark/tree/master/core/src/main/scala/org/apache/spark)

1. api：Spark 的 Java，Python 和 R 的编程接口实现。
2. broadcast：广播变量的编程实现。
3. deploy：Spark 的部署与启动的编程实现。
4. executor：Worker 节点执行 Task（计算）的编程实现。
5. input：各种输入流如文件、定长数据的编程实现。
6. internal：辅助工具的编程实现，例如日志。
7. io：压缩算法等。
8. launcher：Spark 处理与 Launcher Server 通信的编程实现。
9. mapred：
10. memory
11. metrics
12. network
13. partial
14. rdd
15. rpc
16. scheduler
17. security
18. serializer
19. shuffle
20. status
21. storage
22. ui
23. util


