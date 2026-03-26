import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/budget/summary');
        setSummary(response.data);
      } catch (err) {
        setError('Failed to load summary.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const statusColor = {
    Comfortable: '#00c896',
    Tight: '#f5a623',
    Difficult: '#ff6b35',
    Overspending: '#ff3b5c',
  };

  const spentPercent = summary
    ? Math.min((summary.totalExpenses / summary.budget) * 100, 100).toFixed(0)
    : 0;

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navBrand}>
          <span style={styles.navLogo}>₹</span>
          <span style={styles.navTitle}>MoneyMelt</span>
        </div>
        <div style={styles.navLinks}>
          <Link to="/expenses" style={styles.navLink}>Expenses</Link>
          <Link to="/expenses/add" style={styles.navLinkActive}>+ Add</Link>
          <Link to="/budget" style={styles.navLink}>Budget</Link>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.hero}>
          <p style={styles.heroSub}>WELCOME BACK</p>
          <h1 style={styles.heroTitle}>{user?.name} 👋</h1>
          <p style={styles.heroDesc}>Here's where your money went this month.</p>
        </div>

        {loading && <p style={styles.loadingText}>Loading your data...</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        {summary && (
          <>
            {summary.budget === 0 && (
              <div style={styles.warningBanner}>
                <span>⚠️ You haven't set a monthly budget yet.</span>
                <Link to="/budget" style={styles.warningLink}>Set it now →</Link>
              </div>
            )}

            <div style={styles.statRow}>
              <div style={styles.statCard}>
                <p style={styles.statLabel}>MONTHLY BUDGET</p>
                <p style={{ ...styles.statValue, color: '#4f9eff' }}>
                  ₹{summary.budget.toLocaleString()}
                </p>
              </div>
              <div style={{ ...styles.statCard, ...styles.statCardCenter }}>
                <p style={styles.statLabel}>TOTAL SPENT</p>
                <p style={{ ...styles.statValue, color: '#ff3b5c' }}>
                  ₹{summary.totalExpenses.toLocaleString()}
                </p>
              </div>
              <div style={styles.statCard}>
                <p style={styles.statLabel}>REMAINING</p>
                <p style={{
                  ...styles.statValue,
                  color: summary.remaining >= 0 ? '#00c896' : '#ff3b5c'
                }}>
                  ₹{summary.remaining.toLocaleString()}
                </p>
              </div>
            </div>

            <div style={styles.progressSection}>
              <div style={styles.progressHeader}>
                <span style={styles.progressLabel}>Budget used</span>
                <span style={styles.progressPercent}>{spentPercent}%</span>
              </div>
              <div style={styles.progressTrack}>
                <div style={{
                  ...styles.progressFill,
                  width: `${spentPercent}%`,
                  background: spentPercent > 90 ? '#ff3b5c' : spentPercent > 60 ? '#f5a623' : '#00c896',
                }} />
              </div>
            </div>

            <div style={styles.statusRow}>
              <div style={{
                ...styles.statusBadge,
                background: statusColor[summary.status] + '20',
                border: `1px solid ${statusColor[summary.status]}40`,
                color: statusColor[summary.status],
              }}>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: statusColor[summary.status],
                  display: 'inline-block', marginRight: '8px'
                }} />
                {summary.status}
              </div>
              <span style={styles.monthTag}>{summary.month}</span>
            </div>

            <div style={styles.actionGrid}>
              <Link to="/expenses/add" style={styles.actionCard}>
                <div style={styles.actionIcon}>+</div>
                <div>
                  <p style={styles.actionTitle}>Add Expense</p>
                  <p style={styles.actionDesc}>Log a new transaction</p>
                </div>
              </Link>
              <Link to="/expenses" style={styles.actionCard}>
                <div style={{ ...styles.actionIcon, background: '#4f9eff20', color: '#4f9eff' }}>☰</div>
                <div>
                  <p style={styles.actionTitle}>View All</p>
                  <p style={styles.actionDesc}>Browse your expenses</p>
                </div>
              </Link>
              <Link to="/budget" style={styles.actionCard}>
                <div style={{ ...styles.actionIcon, background: '#a78bfa20', color: '#a78bfa' }}>⚙</div>
                <div>
                  <p style={styles.actionTitle}>Set Budget</p>
                  <p style={styles.actionDesc}>Update monthly limit</p>
                </div>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0f',
    color: '#f0f0f5',
    fontFamily: "'DM Sans', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  blob1: {
    position: 'fixed',
    top: '-120px',
    right: '-120px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #4f9eff22, transparent 70%)',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'fixed',
    bottom: '-100px',
    left: '-100px',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #00c89622, transparent 70%)',
    pointerEvents: 'none',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.2rem 2.5rem',
    borderBottom: '1px solid #ffffff10',
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: '#0a0a0f99',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  navLogo: {
    fontSize: '22px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #4f9eff, #00c896)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navTitle: {
    fontSize: '18px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    color: '#f0f0f5',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  navLink: {
    padding: '8px 16px',
    color: '#aaaacc',
    textDecoration: 'none',
    fontSize: '14px',
    borderRadius: '8px',
  },
  navLinkActive: {
    padding: '8px 16px',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '14px',
    borderRadius: '8px',
    background: '#00c896',
    fontWeight: '600',
  },
  logoutBtn: {
    padding: '8px 16px',
    background: '#ff3b5c15',
    color: '#ff3b5c',
    border: '1px solid #ff3b5c30',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '3rem 2rem',
    position: 'relative',
    zIndex: 1,
  },
  hero: { marginBottom: '3rem' },
  heroSub: {
    fontSize: '11px',
    letterSpacing: '3px',
    color: '#00c896',
    fontWeight: '600',
    marginBottom: '8px',
  },
  heroTitle: {
    fontSize: '42px',
    fontWeight: '800',
    margin: '0 0 8px',
    letterSpacing: '-1.5px',
    color: '#f0f0f5',
  },
  heroDesc: { fontSize: '16px', color: '#8888aa', margin: 0 },
  loadingText: { color: '#8888aa', textAlign: 'center', padding: '3rem' },
  errorText: { color: '#ff3b5c', textAlign: 'center', padding: '1rem' },
  warningBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    background: '#f5a62315',
    border: '1px solid #f5a62330',
    borderRadius: '12px',
    marginBottom: '2rem',
    fontSize: '14px',
    color: '#f5a623',
  },
  warningLink: { color: '#f5a623', fontWeight: '700', textDecoration: 'none' },
  statRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    padding: '1.8rem',
    background: '#13131f',
    border: '1px solid #ffffff0f',
    borderRadius: '16px',
    textAlign: 'center',
  },
  statCardCenter: {
    border: '1px solid #ff3b5c20',
    background: '#ff3b5c08',
  },
  statLabel: {
    fontSize: '10px',
    letterSpacing: '2px',
    color: '#8888aa',
    marginBottom: '10px',
    fontWeight: '600',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '800',
    margin: 0,
    letterSpacing: '-1px',
  },
  progressSection: {
    background: '#13131f',
    border: '1px solid #ffffff0f',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  progressLabel: { fontSize: '13px', color: '#8888aa' },
  progressPercent: { fontSize: '13px', fontWeight: '700', color: '#f0f0f5' },
  progressTrack: {
    height: '8px',
    background: '#ffffff10',
    borderRadius: '99px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '99px',
    transition: 'width 0.8s ease',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '2.5rem',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    borderRadius: '99px',
    fontSize: '13px',
    fontWeight: '600',
  },
  monthTag: {
    fontSize: '12px',
    color: '#8888aa',
    background: '#ffffff08',
    padding: '6px 12px',
    borderRadius: '99px',
    border: '1px solid #ffffff10',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '1rem',
  },
  actionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '1.2rem',
    background: '#13131f',
    border: '1px solid #ffffff0f',
    borderRadius: '16px',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  actionIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#00c89620',
    color: '#00c896',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '700',
    flexShrink: 0,
  },
  actionTitle: {
    margin: '0 0 2px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#f0f0f5',
  },
  actionDesc: { margin: 0, fontSize: '12px', color: '#8888aa' },
};

export default Dashboard;
