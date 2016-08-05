module.exports = function(grunt) {

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
		jade: {
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
			jade: {
				files: 'jade/**/*.jade',
				tasks: ['jade']
			},
			css: {
				files: '**/*.{scss,sass}',
				tasks: ['sass','autoprefixer'] // add ,'autoprefixer' here to switch it on, its off cos it disables source-mapping
			},
			html: {
				files: '*.html',
			},
			scripts: {
				files: 'js/**/*.js',
			},
		}, // watch

	});
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.registerTask('default',['jade','connect','watch']);
}