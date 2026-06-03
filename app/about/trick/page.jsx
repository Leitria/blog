'use client';
import { useState, useEffect } from 'react';

export default function PrankPage() {
  const [inputValue, setInputValue] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  // 防止用户通过浏览器后退/前进按钮逃离
  useEffect(() => {
    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 尝试关闭/退出页面的主函数
  const attemptExit = () => {
    setShowModal(true);
    setError('');
    setInputValue('');
  };

  const handleConfirm = () => {
    if (inputValue === '爸爸') {
      // 解除后退拦截并关闭当前标签页
      window.removeEventListener('popstate', () => {});
      window.close();
      // 备用方案：如果window.close被浏览器禁止，跳转到无害页面
      setTimeout(() => {
        window.location.href = 'https://www.baidu.com';
      }, 100);
    } else {
      setError('叫爸爸');
      if (inputValue === '就不'){
        setError('行啊，挺有骨气');
      }
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>😜 你好呀，来自远方的朋友</h1>
      <h1 style={styles.title}>这是为你准备的惊喜，请输入“我要礼物”</h1>
      <p style={styles.description}>
        这是一个小小的整蛊页面，试试点下面的按钮？
      </p>
      <button style={styles.button} onClick={attemptExit}>
        退出
      </button>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>嘿嘿</h3>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="嘿嘿..."
              style={styles.input}
              autoFocus
            />
            {error && <p style={styles.error}>{error}</p>}
            <button style={styles.modalButton} onClick={handleConfirm}>
              一键领取！
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    fontFamily: 'sans-serif',
    textAlign: 'center',
    padding: '20px',
  },
  title: { fontSize: '2.5rem', color: '#ff6b6b' },
  description: { fontSize: '1.2rem', margin: '20px 0', color: '#333' },
  button: {
    padding: '12px 24px',
    fontSize: '1rem',
    backgroundColor: '#ff4757',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    width: '300px',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '8px',
    margin: '15px 0',
    border: '1px solid #f0f0f0',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  error: { color: 'red', margin: '5px 0' },
  modalButton: {
    padding: '8px 16px',
    backgroundColor: '#1461de',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};