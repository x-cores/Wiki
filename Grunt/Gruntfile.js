module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		watch: {
			scripts: {
				files: [
					"config/*.js",
					"utility/*.js",
					"controllers/*.js", 
					"services/*.js", 
					"public/javascripts/view/*.js"
				],
				tasks: [
					"ngAnnotate", 
					"jshint", 
					"concat:stage1", 
					"concat:stage2", 
					"uglify"
				]
			}
		},
		concat: {
			options: {
				separator: ";",
				stripBanners: true
			},
			stage1: {
				files: {
					"dist/extra.intrm.js": [
						"config/*.js", 
						"utility/*.js", 
					],
					"dist/view.intrm.js": [
						"public/javascripts/view/*.js"
					],
					"dist/main.intrm.js": [
						"annotated/controllers/*.js",
					],
					"dist/service.intrm.js": [
						"annotated/services/*.js",
					]
				}
			},
			stage2: {
				files: {
					"dist/index.intrm.js": [
						"dist/extra.intrm.js",
						"dist/view.intrm.js",
						"dist/service.intrm.js",
						"dist/main.intrm.js"
					]
				}
			},
		},
		uglify: {
			options: {},
			dist: {
				files: {
					"index.min.js": "dist/index.intrm.js"
				}
			}
		},
		jshint: {
			files: [
				"config/*.js",
				"utility/*.js",
				"controllers/*.js",
				"services/*.js",
				"public/javascripts/view/*.js"
			],
			options: {
				globals: {
					jQuery: true,
					console: true,
					module: true,
					document: true
				}
			}
		},
		ngAnnotate: {
			options: {
				singleQuotes: true
			},
			app: {
				files: [{
					expand: true,
					src: [
						"controllers/*.js",
						"services/*.js"
					],
					rename: function (dest, src) { return "annotated/" + src; },
				}]
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-ng-annotate");

	// grunt.registerTask("default", ["ngAnnotate", "jshint", "concat", "uglify", "cssmin", "watch"]);
	grunt.registerTask("default", [
		"ngAnnotate", 
		"jshint", 
		"concat:stage1", 
		"concat:stage2", 
		"uglify",
		"watch"
	]);
}
