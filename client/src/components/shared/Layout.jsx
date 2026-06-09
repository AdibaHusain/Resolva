import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .layout {
          display: flex;
          min-height: 100vh;
          background: #0F1115;
          font-family: 'DM Sans', sans-serif;
          color: #FFFFFF;
        }
        .layout-main {
          flex: 1;
          overflow-y: auto;
          min-width: 0;
        }
      `}</style>
      <div className="layout">
        <Sidebar />
        <main className="layout-main">{children}</main>
      </div>
    </>
  )
}