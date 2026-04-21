import { z } from 'zod';

export function zodResolver(schema: z.ZodSchema<any>) {
  return (values: any) => {
    try {
      schema.parse(values);
      return {};
    } catch (err) {
      if (err instanceof z.ZodError) {
        const results: Record<string, string> = {};
        err.issues.forEach((issue) => {
          const path = issue.path.join('.');
          results[path] = issue.message;
        });
        return results;
      }
      return {};
    }
  };
}
