1. Install Java in Directory /usr/lib/jvm/jdk1.8.0_181/

    export JAVA_HOME=/usr/lib/jvm/jdk1.8.0_181
    export JRE_HOME=${JAVA_HOME}/jre
    export CLASSPATH=.:${JAVA_HOME}/lib:${JRE_HOME}/lib
    export PATH=${JAVA_HOME}/bin:$PATH

    sudo update-alternatives --install /usr/bin/java java /usr/lib/jvm/jdk1.8.0_181/bin/java 300
    sudo update-alternatives --install /usr/bin/javac javac /usr/lib/jvm/jdk1.8.0_181/bin/javac 300
    sudo update-alternatives --install /usr/bin/jar jar /usr/lib/jvm/jdk1.8.0_181/bin/jar 300
    sudo update-alternatives --install /usr/bin/javah javah /usr/lib/jvm/jdk1.8.0_181/bin/javah 300
    sudo update-alternatives --install /usr/bin/javap javap /usr/lib/jvm/jdk1.8.0_181/bin/javap 300
    sudo update-alternatives --config java

2. Download Hadoop & Hive & Spark

    [Hive]: http://hive.apache.org/downloads.html
    [Hadoop]: https://hadoop.apache.org/releases.html
    [Spark]: http://spark.apache.org/downloads.html

3. vim etc/hadoop/core-site.xml:

    <configuration>
        <property>
            <name>fs.defaultFS</name>
            <value>hdfs://localhost:9000</value>
        </property>
        <property>
            <name>hadoop.tmp.dir</name>
            <value>/home/phoenix/data/hadoop/tmp</value>
        </property>
        <property>
            <name>hadoop.proxyuser.phoenix.hosts</name>
            <value>*</value>
        </property>
        <property>
            <name>hadoop.proxyuser.phoenix.groups</name>
            <value>*</value>
        </property>
    </configuration>

4. vim etc/hadoop/hdfs-site.xml:

    <configuration>
        <property>
            <name>dfs.replication</name>
            <value>1</value>
        </property>
        <property>
            <name>dfs.http.address</name>
            <value>0.0.0.0:50070</value>
        </property>
        <property>
            <name>dfs.namenode.name.dir</name>
            <value>/home/phoenix/data/hadoop/name</value>
        </property>
        <property>
            <name>dfs.datanode.name.dir</name>
            <value>/home/phoenix/data/hadoop/data</value>
        </property>
    </configuration>

5. vim etc/hadoop/hadoop-env.sh 

    export JAVA_HOME=/usr/lib/jvm/jdk1.8.0_191
    export JRE_HOME=${JAVA_HOME}/jre
    export CLASSPATH=.:${JAVA_HOME}/lib:${JRE_HOME}/lib
    export HADOOP_HOME=/home/phoenix/programs/hadoop-2.9.2
    export HADOOP_CONF_DIR=${HADOOP_HOME}/etc/hadoop
    export HIVE_HOME=/home/phoenix/programs/apache-hive-2.3.4-bin
    export PATH=${HADOOP_HOME}/bin:${HIVE_HOME}/bin:${JAVA_HOME}/bin:$PATH
    export KYLO_HOME=/home/phoenix/programs/kylo-0.9.1.1

6. Format the hdfs and start dfs service

    bin/hdfs namenode -format
    sbin/start-all.sh

7. Enable Yarn with vim etc/hadoop/mapred-site.xml

    <configuration>
        <property>
            <name>mapreduce.framework.name</name>
            <value>yarn</value>
        </property>
    </configuration>

8. Enable Yarn with vim etc/hadoop/yarn-site.xml

    <configuration>
        <property>
            <name>yarn.nodemanager.aux-services</name>
            <value>mapreduce_shuffle</value>
        </property>
    </configuration>

9. Prepare Hive

    $HADOOP_HOME/bin/hadoop fs -mkdir -p /tmp
    $HADOOP_HOME/bin/hadoop fs -mkdir /user/hive/warehouse
    $HADOOP_HOME/bin/hadoop fs -chmod g+w /tmp
    $HADOOP_HOME/bin/hadoop fs -chmod g+w /user/hive/warehouse

10. Start Hive Cli

    $HIVE_HOME/bin/hive

11. Starting from Hive 2.1, we need to run the schematool command below as an initialization step

    $HIVE_HOME/bin/schematool -dbType derby -initSchema

    Error: FUNCTION 'NUCLEUS_ASCII' already exists.
    Solution: mv metastore_db/ metastore_db.tmp

12. Start HiveServer2

    $HIVE_HOME/bin/hiveserver2

13. Run beeline

    $HIVE_HOME/bin/beeline -u jdbc:hive2://localhost:10000

14. Install Kylo

    sudo /apps/kylo/setup/install/post-install.sh /apps/kylo ad_kylo users

15. Install Spark

    Unzip Spark binary package 