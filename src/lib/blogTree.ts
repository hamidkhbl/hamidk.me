export interface TreeNode {
  name: string;
  path: string; // full path from root, e.g. "automation/playwright"
  posts: { id: string; title: string }[];
  children: Record<string, TreeNode>;
}

export function buildTree(
  posts: { id: string; data: { title: string; category: string } }[]
): Record<string, TreeNode> {
  const root: Record<string, TreeNode> = {};

  for (const post of posts) {
    const parts = post.data.category.split('/').map(p => p.trim()).filter(Boolean);
    let current = root;
    let pathSoFar = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      pathSoFar = pathSoFar ? `${pathSoFar}/${part}` : part;

      if (!current[part]) {
        current[part] = { name: part, path: pathSoFar, posts: [], children: {} };
      }

      if (i === parts.length - 1) {
        current[part].posts.push({ id: post.id, title: post.data.title });
      } else {
        current = current[part].children;
      }
    }
  }

  return root;
}

export function formatNodeName(name: string): string {
  return name.replace(/-/g, ' ');
}
