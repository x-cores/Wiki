# Git 实践 #

---

1. 删除远程分支已经删除的本地分支（标签）

    ```bash
    git fetch --prune --prune-tags
    ```

1. 创建标签，并推送到远程标签

    ```bash
    git tag -a [新标签名] -m [新标签描述]
    git push origin [新远程标签名]
    ```

1. 从标签创建分支，并推送到远程分支

    ```bash
    git branch [新本地分支] [标签名]
    git checkout [新本地分支]
    git push origin [新远程分支]
    ```
