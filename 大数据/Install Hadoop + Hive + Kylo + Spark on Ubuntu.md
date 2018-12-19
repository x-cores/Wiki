1. Install Java in Directory /usr/lib/jvm/jdk1.8.0_181/

    vim /etc/profile

        export JAVA_HOME=/usr/lib/jvm/jdk1.8.0_181
        export JRE_HOME=${JAVA_HOME}/jre
        export CLASSPATH=.:${JAVA_HOME}/lib:${JRE_HOME}/lib
        export PATH=${JAVA_HOME}/bin:$PATH

    run in shell

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

    extract Hadoop, Hive and Spark to ${HOME}/programs

3. Install MySQL as Hive metastore

        [MySQL APT]: https://dev.mysql.com/downloads/repo/apt/

    download and install mysql-apt-config_0.8.11-1_all.deb, follow the guidance, choose MySQL 5 instead of default

        sudo apt-get -y install mysql-server
        sudo apt-get -y install mysql-connector-java

4. Copy /usr/share/java/mysql-connector-java-8.0.13.jar

        cp /usr/share/java/mysql-connector-java-8.0.13.jar %{HIVE_HOME}/lib
        cp /usr/share/java/mysql-connector-java-8.0.13.jar %{SPARK_HOME}/jars

5. Create MySQL user for Hive

        create user 'hive'@'%' identified by 'hive';
        grant all on *.* to 'hive'@'%' identified by 'hive';
        flush privileges;

6. vim ${HIVE_HOME}/conf/hive-site.xml:

        <property>
            <name>hive.exec.scratchdir</name>
            <value>/tmp/hive</value>
        </property>
        <property>
            <name>hive.metastore.warehouse.dir</name>
            <value>/user/hive/warehouse</value>
        </property>
        <property>
            <name>hive.querylog.location</name>
            <value>/user/hive/log</value>
        </property>
        <property>
            <name>javax.jdo.option.ConnectionURL</name>
            <value>jdbc:mysql://localhost:3306/hive?createDatabaseIfNotExist=true</value>
        </property>
        <property>
            <name>javax.jdo.option.ConnectionDriverName</name>
            <value>com.mysql.jdbc.Driver</value>
        </property>
        <property>
            <name>javax.jdo.option.ConnectionUserName</name>
            <value>root</value>
        </property>
        <property>
            <name>javax.jdo.option.ConnectionPassword</name>
            <value>root</value>
        </property>
        <property>
            <name>hive.exec.script.wrapper</name>
            <value/>
        <description/>
        </property>
        <property>
            <name>hive.metastore.schema.verification</name>
            <value>false</value>
        </property>

7. vim ${HADOOP_HOME}/etc/hadoop/core-site.xml:

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

8. vim ${HADOOP_HOME}/etc/hadoop/hdfs-site.xml:

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

9. vim ${HADOOP_HOME}/etc/hadoop/hadoop-env.sh 

        export JAVA_HOME=/usr/lib/jvm/jdk1.8.0_191
        export JRE_HOME=${JAVA_HOME}/jre
        export CLASSPATH=.:${JAVA_HOME}/lib:${JRE_HOME}/lib
        export HADOOP_HOME=/home/phoenix/programs/hadoop-2.9.2
        export HADOOP_CONF_DIR=${HADOOP_HOME}/etc/hadoop
        export HIVE_HOME=/home/phoenix/programs/apache-hive-2.3.4-bin
        export ANACONDA_HOME=/home/phoenix/anaconda2
        export SPARK_HOME=/home/phoenix/programs/spark-2.4.0-bin-hadoop2.7
        export PATH=${HADOOP_HOME}/bin:${HIVE_HOME}/bin:${SPARK_HOME}/bin:${JAVA_HOME}/bin:$PATH
        export KYLO_HOME=/home/phoenix/programs/kylo-0.9.1.1

10. Enable Yarn with vim ${HADOOP_HOME}/etc/hadoop/mapred-site.xml

        <configuration>
            <property>
                <name>mapreduce.framework.name</name>
                <value>yarn</value>
            </property>
        </configuration>

11. Enable Yarn with vim ${HADOOP_HOME}/etc/hadoop/yarn-site.xml

        <configuration>
            <property>
                <name>yarn.nodemanager.aux-services</name>
                <value>mapreduce_shuffle</value>
            </property>
        </configuration>

12. vim ${SPARK_HOME}/conf/spark-env.sh

        export SPARK_MASTER_HOST=0.0.0.0
        export SPARK_EXECUTOR_CORES=2
        export SPARK_EXECUTOR_MEMORY=2G
        export SPARK_WORKER_CORES=2
        export SPARK_WORKER_MEMORY=2G
        export SPARK_DAEMON_MEMORY=2G

13. Format the hdfs and start dfs service

        bin/hdfs namenode -format
        sbin/start-all.sh

14. Prepare Hive

        hdfs dfs -mkdir -p /user/hive/warehouse
        hdfs dfs -mkdir -p /user/hive/tmp
        hdfs dfs -mkdir -p /user/hive/log
        hdfs dfs -chmod -R 777 /user/hive/warehouse
        hdfs dfs -chmod -R 777 /user/hive/tmp
        hdfs dfs -chmod -R 777 /user/hive/log

15. Starting from Hive 2.1, we need to run the schematool command below as an initialization step

        $HIVE_HOME/bin/schematool -dbType mysql -initSchema

    Error: FUNCTION 'NUCLEUS_ASCII' already exists.
    Solution: mv metastore_db/ metastore_db.tmp

16. Start Hive service

        ${HIVE_HOME}/bin/hive --service metastore

17. Run Hive

        ${HIVE_HOME}/bin/hive

18. Run beeline

        ${HIVE_HOME}/bin/beeline -u jdbc:hive2://localhost:10000

19. Start Spark

        ${SPARK_HOME}/sbin/start-master.sh
        ${SPARK_HOME}/sbin/start-slave.sh

20. Run Spark

        ${SPARK_HOME}/bin/spark-shell --master spark://localhost:7077 --conf spark.executor.memory=2g --conf spark.executor.cores=2 --conf spark.executor.instances=2

21. Install Kylo

        sudo /apps/kylo/setup/install/post-install.sh /apps/kylo ad_kylo users 