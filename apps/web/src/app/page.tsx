const sections = [
  "Web 管理台与初始化流程会从这里展开",
  "服务端 API 将继续下沉到 packages/*",
  "当前阶段只保留可继续施工的基础骨架"
];

export default function HomePage() {
  return (
    <main className="shell">
      <section className="panel">
        <span className="eyebrow">ObsidianHub</span>
        <h1>Minimal Web Scaffold</h1>
        <p>
          Next.js App Router 已初始化，后续管理台、初始化向导与 API route handlers
          可以在这个基础上继续扩展。
        </p>
        <ul>
          {sections.map((section) => (
            <li key={section}>{section}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
