function Scene() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img 
        src="/logo-128.png" 
        alt="Logo"
        style={{ width: '60%', height: '60%', objectFit: 'contain' }}
      />
    </div>
  );
}

export default Scene;
