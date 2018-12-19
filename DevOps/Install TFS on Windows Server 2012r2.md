1. Download Resources

        [TFS 2017 Express]: https://go.microsoft.com/fwlink/?LinkId=839780
        [SQL SERVER 2016 EVALUATION]: https://www.microsoft.com/en-us/evalcenter/evaluate-sql-server-2016
        [JENKINS]: https://jenkins.io/download/

2. Install Service Fabric Cluster on Local Machine

    Create a single node cluster for testing

3.  Install JDK 1.8 and Configure System Variables

        JAVA_HOME=C:\Program Files\Java\jdk1.8.0_191
        CLASSPATH=C:\Program Files\Java\jdk1.8.0_191\lib
        PATH=C:\Program Files\Java\jdk1.8.0_191\bin

4. Install SQL Server 2016 (tfs2017 only support SQL Server 2016)

    Install Features: Core Engine, FullText Search, Analysis Service, Reporting Service

    Configure Firewall: Add exception for port 2382

    Configure Reporting Service and Analysis Service before moving next steps. (Create reporting database in Reporting Service Configuration Tool)

5. Install TFS

    Enable Search and Reporting features. Note, ElasticSearch will be installed.

    TFS will use port 8080.

    If get some errors, run 'sc delete elasticsearch-service-x64' to remove service and delete 'C:/TfsData/Search/' to delete the index files.

6. Install Build Agents

    Go to 'Settings' -> 'Agent Queues', click the download button to get the Build Agent.

    Set the build agent capabilities as (dotnet,1), (msbuild, 1) and (visualstudio, 1)

7. Download and Install DotNet Core on Build Agent Node

    https://download.visualstudio.microsoft.com/download/pr/3f674c39-ab51-45c3-a7b8-094d86594fbc/9f7efb24d3486086b2d1f1a8d205a776/dotnet-hosting-2.1.6-win.exe

    Reboot Build Agent after install DotNet Core SDK

8. Install VisualStudio 2017 Build Tools

    https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools&rel=15

9. Build Defination Params

        1) NuGet Restore
            **\*.sln
        2) DotNet restore
        3) DotNet build
        4) DotNet msbuild
            "Voting\Voting.sfproj" /nologo /nr:false /t:Package /p:PackageLocation=pkg /p:platform="x64" /p:configuration="Release" /p:VisualStudioVersion="14.0"
        5) Copy File to
            Voting\pkg
            **\*
            $(build.artifactstagingdirectory)\projectartifacts
        6) Update Service Fabric Application Version
            $(build.artifactstagingdirectory)\projectartifacts
            .$(build.buildnumber)
        7) Publish Voting
            $(build.artifactstagingdirectory)\projectartifacts
            Voting
        8) Deploy to Service Fabric
            $(build.artifactstagingdirectory)\projectartifacts
            Service Fabric Local (tcp://localhost:19000)
            Voting/PublishProfiles/Local.1Node.xml
            Voting/ApplicationParameters/Local.1Node.xml