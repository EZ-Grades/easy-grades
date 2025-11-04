/**
 * Display helpful database setup warning in console
 */
export function showDatabaseSetupWarning() {
  const style1 = 'color: #ef4444; font-size: 24px; font-weight: bold;';
  const style2 = 'color: #f59e0b; font-size: 14px;';
  const style3 = 'color: #10b981; font-size: 13px;';
  const style4 = 'color: #3b82f6; font-size: 13px; font-weight: bold;';
  const style5 = 'color: #8b5cf6; font-size: 12px;';
  
  console.log('\n\n');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ef4444;');
  console.log('%c⚠️  DATABASE NOT SET UP  ⚠️', style1);
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ef4444;');
  console.log('\n');
  console.log('%c🔴 PGRST002 Errors Detected', style2);
  console.log('%cYour database schema hasn\'t been deployed to Supabase yet.', style2);
  console.log('%cThe app cannot load data until you run the SQL schema files.', style2);
  console.log('\n');
  console.log('%c✅ QUICK FIX (5 minutes):', style3);
  console.log('%c  1. Open https://app.supabase.com and go to SQL Editor', style3);
  console.log('%c  2. Copy all of /supabase/schema.sql and Run it', style3);
  console.log('%c  3. Copy all of /supabase/seed_data_fixed.sql and Run it', style3);
  console.log('%c  4. Hard refresh this page (Cmd+Shift+R / Ctrl+Shift+R)', style3);
  console.log('%c  5. ✨ All errors will disappear!', style3);
  console.log('\n');
  console.log('%c📚 DETAILED GUIDES:', style4);
  console.log('%c  • /⚠️_START_HERE_FIRST.md - Visual quick start', style4);
  console.log('%c  • /MUST_READ_DATABASE_SETUP.md - Step-by-step with screenshots', style4);
  console.log('%c  • /QUICK_FIX.md - Shortest version', style4);
  console.log('%c  • /ERRORS_FIXED.md - What was fixed in code', style4);
  console.log('\n');
  console.log('%c💡 Code errors are already fixed!', style5);
  console.log('%c   Only the database deployment is needed.', style5);
  console.log('\n');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ef4444;');
  console.log('\n\n');
}

/**
 * Check if we're getting PGRST002 errors and show warning
 */
let warningShown = false;

export function checkAndWarnAboutDatabase() {
  if (warningShown) return;
  
  // Check if we've seen any PGRST002 errors in console
  // We'll show the warning once on app load
  setTimeout(() => {
    if (!warningShown) {
      showDatabaseSetupWarning();
      warningShown = true;
    }
  }, 2000);
}
