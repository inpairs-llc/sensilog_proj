import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:3001/graphql',
  documents: './src/gql/index.ts',
  generates: {
    './src/gql/gen/generated.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        {
          'typescript-rtk-query': {
            importBaseApiFrom: 'src/gql/baseApi',
            exportHooks: true,
          },
        },
      ],
    },
  },
};

export default config;
