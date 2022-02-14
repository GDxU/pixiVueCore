
PlistDumper
--------------

# 中文 (Chinese)

从 `Zwoptex` 或者 `TexturePacker` 的 `plist` 文件中导出图片，还原图片真实大小。支持各种版本的 plist 文件。类似于 `TextureUnpacker`。

采用 `golang` 开发，支持各种操作系统。

## 使用说明

```
$ PlistDumper [plistfile]
```

* 直接运行不传任何参数，则解压当前文件夹中所有 `plist` 文件，包括子文件夹。

### 依赖库

安装 `go-plist` 库：

```
$ go get github.com/DHowett/go-plist
```

# English

Export the image from the `Zwoptex` or `TexturePacker`'s  `plist` file, support all version of plist, similar to `TextureUnpacker`.

Developed with `golang`, and support most popular operating systems.

## Usage

```
$ PlistDumper [plistfile]
```

* If you don't give the plistfile, then will unpack all plist in the folder and subfolder.

### Dependent library

Install `go-plist` library：

```
$ go get github.com/DHowett/go-plist
```

# Preview / 预览

![preview](./preview.jpg)

# Credits

- qcdong2016
- shines77
