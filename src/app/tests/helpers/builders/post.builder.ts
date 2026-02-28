import { Post } from '../../../features/posts/models/post';

export function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 1,
    title: 'Test title',
    body: 'Test body',
    ...overrides,
  };
}

export function makePosts(count = 2): Post[] {
  return Array.from({ length: count }, (_, i) =>
    makePost({ id: i + 1, title: `Title ${i + 1}`, body: `Body ${i + 1}` })
  );
}
