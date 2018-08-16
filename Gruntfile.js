module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		connect: {
			server: {
				options: {
					port: 9002,
					base: '.',
					open: true,
					livereload: false
				}
			}
		},
		
		/**
		 * Jade
		 */
		pug: {
		  compile: {
			options: {
			  pretty: true,
			},
			files: {
				'index.html' : 'jade/index.jade',
				'cs/index.html' : 'jade/cs/index.jade',
				'gr/index.html' : 'jade/gr/index.jade'
			}
		  }
        },
        babel: {
            options: {
                sourceMap: false,
                presets: ['env']
            },
            dist: {
                files: {
                    'js/functions-babeled.js': 'js/functions.js'
                }
            }
        },
		/**
		 * Uglify
		 */        
        uglify: {
          my_target: {
            files: {
              'js/funcs-min.js': ['js/functions-babeled.js']
            }
          }
        },

		/**
		 * Sass
		 */
		sass: {
			
		  dev: {
		    options: {
		      style: 'expanded',
		      sourcemap: 'auto',
		    },
		    files: {
              'style.css': 'sass/main.scss'
		    }
		  },
		
		  // Concatenate CSS when done with development
		  
		  dist: {
			options: {
			  style: 'compressed',
			  sourcemap: 'none',
			},
			files: {
			  'style-min.css': 'sass/main.scss'
			}
		  }			
		  
		},

		/**
		 * Autoprefixer
		 */
		autoprefixer: {
			options: {
				browsers: ['last 2 versions']
			},
			// prefix all files
			multiple_files: {
				expand: true,
				flatten: true,
				src: '*.css',
				dest: ''
			}
		},

	  	/**
	  	 * Watch
	  	 */
		watch: {
			options: { livereload: true},
			pug: {
				files: 'jade/**/*.jade',
				tasks: ['pug']
			},
			css: {
				files: '**/*.{scss,sass}',
				tasks: ['sass','autoprefixer'] // add ,'autoprefixer' here to switch it on, its off cos it disables source-mapping
			},
			html: {
				files: '*.html',
			},
			scripts: {
                files: 'js/functions.js',
                tasks: ['babel', 'uglify']
			},
		}, // watch

	});
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-pug');
    grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.registerTask('default',['pug','connect','watch']);
}