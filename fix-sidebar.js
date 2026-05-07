const fs = require('fs');
const path = 'app/components/Sidebar.tsx';

let content = fs.readFileSync(path, 'utf8');

const navItemsReplacement = `const navItems = [
  { name: "Dashboard", icon: "?", path: "/dashboard" },
  { name: "Products", icon: "?", path: "/products" },
  { name: "AI Agents", icon: "?", path: "/agents" },
  { name: "AI Chat", icon: "?", path: "/ai-chat" },
  { name: "Documents", icon: "?", path: "/documents" },
  { name: "Orders", icon: "?", path: "/orders" },
  { name: "Leads", icon: "??", path: "/leads" },
  { name: "Pricing", icon: "??", path: "/pricing" },
  { name: "Settings", icon: "?", path: "/settings" }
];`;

content = content.replace(/const navItems = \[[\s\S]*?\];/, navItemsReplacement);
fs.writeFileSync(path, content, 'utf8');
console.log('Sidebar fixed!');
