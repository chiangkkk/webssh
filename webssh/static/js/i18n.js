const i18n = {
  // 默认语言
  defaultLang: 'zh',
  
  // 支持的语言列表
  languages: ['zh', 'en'],
  
  // 当前语言
  currentLang: 'zh',
  
  // 语言包
  messages: {
    'zh': {
      'hostname': '主机名',
      'port': '端口',
      'username': '用户名',
      'password': '密码',
      'privatekey': '私钥',
      'passphrase': '密码短语(私钥密码)',
      'totp': '动态口令',
      'connect': '连接',
      'reset': '重置',
      'connecting': '连接中...',
      'this_client_is_connecting': '此客户端正在连接中...',
      'this_client_is_already_connected': '此客户端已经连接。',
      'invalid_hostname': '无效的主机名: ',
      'invalid_port': '无效的端口: ',
      'username_required': '用户名是必需的。',
      'invalid_private_key': '无效的私钥: ',
      'password_via_url_encoded': '通过URL传递的密码必须使用base64编码。',
      'too_many_connections': '连接数过多。',
      'connection_not_allowed': '不允许连接到：',
      'unable_to_connect': '无法连接到：',
      'bad_authentication_type': '错误的认证类型。',
      'authentication_failed': '认证失败。',
      'bad_host_key': '主机密钥错误。',
      'websocket_auth_failed': 'WebSocket认证失败。',
      'websocket_client_disconnected': '客户端断开连接。',
      'no_worker_found': '未找到工作者进程。',
      'worker_closed': '工作者进程已关闭。',
      'value_of_hostname_required': '主机名是必需的。',
      'public_plain_http_forbidden': '禁止使用明文HTTP公共请求。',
      'sessionManager': '会话管理',
      'sshTerminalTitle': 'SSH 终端',
      'connectionSuccessful': '连接成功',
      'connectionFailed': '连接失败'
    },
    'en': {
      'hostname': 'Hostname',
      'port': 'Port',
      'username': 'Username',
      'password': 'Password',
      'privatekey': 'Private Key',
      'passphrase': 'Passphrase',
      'totp': 'Totp (time-based one-time password)',
      'connect': 'Connect',
      'reset': 'Reset',
      'connecting': 'Connecting...',
      'this_client_is_connecting': 'This client is connecting ...',
      'this_client_is_already_connected': 'This client is already connnected.',
      'invalid_hostname': 'Invalid hostname: ',
      'invalid_port': 'Invalid port: ',
      'username_required': 'Value of username is required.',
      'invalid_private_key': 'Invalid private key: ',
      'password_via_url_encoded': 'Password via url must be encoded in base64.',
      'too_many_connections': 'Too many live connections.',
      'connection_not_allowed': 'Connection to ',
      'unable_to_connect': 'Unable to connect to ',
      'bad_authentication_type': 'Bad authentication type.',
      'authentication_failed': 'Authentication failed.',
      'bad_host_key': 'Bad host key.',
      'websocket_auth_failed': 'Websocket authentication failed.',
      'websocket_client_disconnected': 'client disconnected',
      'no_worker_found': 'No worker found',
      'worker_closed': 'Worker closed',
      'value_of_hostname_required': 'Value of hostname is required.',
      'public_plain_http_forbidden': 'Public plain http request is forbidden.',
      'sessionManager': 'Session Manager',
      'sshTerminalTitle': 'SSH Terminal',
      'connectionSuccessful': 'Connection successful',
      'connectionFailed': 'Connection failed'
    }
  },

  // 获取翻译文本
  t(key) {
    const messages = this.messages[this.currentLang] || this.messages[this.defaultLang];
    return messages[key] || key;
  },

  // 设置语言
  setLang(lang) {
    if (this.languages.includes(lang)) {
      this.currentLang = lang;
      this.updatePageLanguage();
      // 保存用户选择的语言到localStorage
      localStorage.setItem('webssh-lang', lang);
      
      // 更新语言切换按钮样式
      if (lang === 'zh') {
        document.getElementById('lang-zh').className = 'btn btn-primary btn-sm';
        document.getElementById('lang-en').className = 'btn btn-outline-secondary btn-sm';
      } else {
        document.getElementById('lang-en').className = 'btn btn-primary btn-sm';
        document.getElementById('lang-zh').className = 'btn btn-outline-secondary btn-sm';
      }
      
      // 更新HTML标签的lang属性
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    }
  },

  // 更新页面语言
  updatePageLanguage() {
    // 更新所有带data-lang-key属性的元素
    document.querySelectorAll('.lang[data-lang-key]').forEach(element => {
      const key = element.getAttribute('data-lang-key');
      element.textContent = this.t(key);
    });
    
    // 更新占位符文本
    document.getElementById('port').placeholder = this.currentLang === 'zh' ? '22' : '22';
    
    // 更新等待提示文本
    const waiter = document.getElementById('waiter');
    if (waiter && waiter.style.display !== 'none') {
      waiter.textContent = this.t('connecting');
    }
  },

  // 初始化语言设置
  init() {
    // 从localStorage恢复用户选择的语言，或者使用默认语言
    const savedLang = localStorage.getItem('webssh-lang');
    if (savedLang && this.languages.includes(savedLang)) {
      this.currentLang = savedLang;
    }
    
    // 绑定语言切换按钮事件
    const langEnBtn = document.getElementById('lang-en');
    const langZhBtn = document.getElementById('lang-zh');
    
    if (langEnBtn) {
      langEnBtn.addEventListener('click', () => {
        this.setLang('en');
      });
    }
    
    if (langZhBtn) {
      langZhBtn.addEventListener('click', () => {
        this.setLang('zh');
      });
    }
    
    // 初始化语言按钮样式
    if (langEnBtn && langZhBtn) {
      if (this.currentLang === 'zh') {
        langZhBtn.className = 'btn btn-primary btn-sm';
        langEnBtn.className = 'btn btn-outline-secondary btn-sm';
      } else {
        langEnBtn.className = 'btn btn-primary btn-sm';
        langZhBtn.className = 'btn btn-outline-secondary btn-sm';
      }
    }
    
    // 更新HTML标签的lang属性
    document.documentElement.lang = this.currentLang === 'zh' ? 'zh-CN' : 'en';
    
    // 初始化页面语言
    this.updatePageLanguage();
  }
};

// 页面加载完成后初始化国际化功能
document.addEventListener('DOMContentLoaded', function() {
  i18n.init();
});