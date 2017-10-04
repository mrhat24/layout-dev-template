module.exports = ({ file, options, env }) => ({
    parser: file.extname === '.sss' ? 'sugarss' : false,
    plugins: {
        'postcss-inline-svg': {},
        'autoprefixer': env == 'production' ? options.autoprefixer : false,
        'postcss-svgo': {}
    }
})