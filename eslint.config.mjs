import { defineConfig } from '@vben/eslint-config';

export default defineConfig([
  {
    rules: {
      // Tắt các rule sắp xếp import gốc và custom của Vben/Perfectionist
      'import/order': 'off',
      'sort-imports': 'off',
      'perfectionist/sort-imports': 'off', // Vben hay dùng plugin perfectionist để sắp xếp
      'vben/import-order': 'off',          // Dự phòng tên rule nội bộ của Vben nếu có
    },
  },
]);
