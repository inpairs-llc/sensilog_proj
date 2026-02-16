import { createApi } from '@reduxjs/toolkit/query/react';
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query';
import { GraphQLClient } from 'graphql-request';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/graphql';

export const client = new GraphQLClient(API_URL);

export const api = createApi({
  baseQuery: graphqlRequestBaseQuery({
    client,
    prepareHeaders: (headers) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ['Me'],
  endpoints: () => ({}),
});
