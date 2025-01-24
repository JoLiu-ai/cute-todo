app/
├── public/
│   ├── index.html          # 主入口文件
│   └── assets/             # 静态资源
├── src/
│   ├── styles/             # 样式文件
│   │   ├── base.css        # 基础样式
│   │   ├── components/     # 组件样式
│   │   │   ├── tasks.css
│   │   │   └── notes.css
│   │   └── animations.css  # 动画
│   └── js/
│       ├── core/           # 核心逻辑
│       │   ├── store.js    # 状态管理
│       │   └── helpers.js  # 工具函数
│       ├── features/       # 功能模块
│       │   ├── tasks.js
│       │   └── notes.js
│       ├── ui/             # UI组件
│       │   ├── Modal.js
│       │   └── Progress.js
│       └── main.js         # 应用入口
├── package.json
└── vite.config.js          # 构建配置