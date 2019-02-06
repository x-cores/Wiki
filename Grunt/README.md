1. 把这两个文件放到网站根目录，以这个网站为例：
/
│  Gruntfile.js
│  index.html
│  package.json
│      
├─config
│      config.js
│      
├─control
│      waiting.template.html
│      
├─controllers
│      AboutController.js
│      
├─public
│          
├─services
│      ActivitiesService.js
│      
├─utility
│      utility.js
│      
└─views
        about.html
        
基本上和大丰收的网站结构是一致的，你可以根据实际上你的目录结构修改 Gruntfile.js 脚本里面的配置。

2. 简单说一下 Gruntfile 这个文件，这个文件里面主要配置了两个东西，一个是步骤定义，一个是步骤列表。步骤定义放的就是每个步骤的配置，步骤列表放的是执行步骤的顺序。

3. 几个步骤：
    watch：监听文件变化，监听目录下文件发生变化以后，会自动执行构建，不需要手工执行命令。
    concat：将多个 js 文件合并成一个
    uglify：将 js 文件做混淆
    jshint：语法检查
    ngAnnotate：可以增加或修改 Angularjs 的依赖（在我的例子里面实际上没有什么用）

4. 给 Grunt 配置任务插件
    grunt.loadNpmTasks("grunt-contrib-concat");

5. 注册任务，registerTask("[任务名称]", ["步骤一", "步骤二", ...])

6. 在把这两个文件都放到网站根目录以后，执行 `npm install --save`，然后再手动执行一下 `npm install -g grunt-cli`

7. 在 Gruntfile.js 同级目录下执行 grunt 就可以完成 js 文件拼接，以及 js 文件混淆，如果你配置了 watch，那这个命令行就会一直执行，只要有文件更改了，就会自动运行配置好的任务。

8. 关于配置文件
    以我给你的这个 Gruntfile.js 为例，看 grunt.registerTask 下面
    1) 首先执行的是 ngAnnotate 处理 AngularJS 依赖，处理完的文件放到根目录下的 annotated/ 下面，annotated 下的文件名和目录名还和原来的一样
    2) 然后运行 jshint 检查语法
    3) 执行 concat.stage1，把 js 文件按照目录分别拼起来，比如 view/*.js 拼到了 dist/view.intrm.js 下面，controllers/*.js 拼到了 dist/main.intrm.js 下面，当然也可以直接拼成最终的文件，不过这里为了方便调试增加了一个中间步骤。
    4) 执行 concat.stage2 把中间文件 dist/view.intrm.js， dist/main.intrm.js 再拼成最终的 dist/index.intrm.js
    5) uglify 将 dist/index.intrm.js 混淆压缩成为最终的 /index.min.js
    6) watch 监控文件变化

9. 在首页里面去掉 controllers, views, services 的那些 js 引用，直接引用 index.min.js 文件，调试的时候可以还引用原始文件，最终发布的时候发布最后的 index.min.js 就可以了