export default {
  singleQuote: true,
  printWidth: 100,
  overrides: [
    {
      files: 'projects/angular/**/*.html',
      options: {
        parser: 'angular',
      },
    },
  ],
};
