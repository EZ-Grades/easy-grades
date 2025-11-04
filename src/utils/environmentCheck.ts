/**
 * Environment Configuration Checker
 * Helps users verify their setup is correct
 */

export interface EnvironmentStatus {
  supabase: {
    configured: boolean;
    url?: string;
    error?: string;
  };
  perplexity: {
    configured: boolean;
    error?: string;
  };
  overall: 'complete' | 'partial' | 'missing';
}

/**
 * Check if Supabase is configured
 */
export function checkSupabaseConfiguration(): { configured: boolean; url?: string; error?: string } {
  try {
    // Safely access environment variables
    const url = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : undefined;
    const key = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : undefined;

    if (!url || !key) {
      return {
        configured: false,
        error: 'Supabase URL or Anon Key is missing from environment variables'
      };
    }

    if (url === 'your-supabase-url' || key === 'your-supabase-anon-key') {
      return {
        configured: false,
        error: 'Supabase credentials need to be replaced with actual values'
      };
    }

    return {
      configured: true,
      url
    };
  } catch (error) {
    return {
      configured: false,
      error: 'Error accessing environment variables'
    };
  }
}

/**
 * Check if Perplexity API is configured
 */
export function checkPerplexityConfiguration(): { configured: boolean; error?: string } {
  try {
    // Safely access environment variables
    const apiKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_PERPLEXITY_API_KEY : undefined;

    if (!apiKey) {
      return {
        configured: false,
        error: 'Perplexity API key is missing from environment variables'
      };
    }

    if (apiKey === 'your-perplexity-api-key-here' || apiKey === 'your-api-key-here') {
      return {
        configured: false,
        error: 'Perplexity API key needs to be replaced with actual value'
      };
    }

    return {
      configured: true
    };
  } catch (error) {
    return {
      configured: false,
      error: 'Error accessing environment variables'
    };
  }
}

/**
 * Get complete environment status
 */
export function getEnvironmentStatus(): EnvironmentStatus {
  const supabase = checkSupabaseConfiguration();
  const perplexity = checkPerplexityConfiguration();

  let overall: 'complete' | 'partial' | 'missing';

  if (supabase.configured && perplexity.configured) {
    overall = 'complete';
  } else if (supabase.configured || perplexity.configured) {
    overall = 'partial';
  } else {
    overall = 'missing';
  }

  return {
    supabase,
    perplexity,
    overall
  };
}

/**
 * Get setup instructions based on missing configuration
 */
export function getSetupInstructions(status: EnvironmentStatus): string[] {
  const instructions: string[] = [];

  if (!status.supabase.configured) {
    instructions.push('1. Configure Supabase:');
    instructions.push('   - Get your Supabase URL and Anon Key from your project dashboard');
    instructions.push('   - Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local');
    instructions.push('');
  }

  if (!status.perplexity.configured) {
    instructions.push('2. Configure Perplexity API:');
    instructions.push('   - Sign up at https://www.perplexity.ai/');
    instructions.push('   - Generate an API key from your account settings');
    instructions.push('   - Add VITE_PERPLEXITY_API_KEY to .env.local');
    instructions.push('');
  }

  if (instructions.length > 0) {
    instructions.push('3. Restart your development server after adding environment variables');
    instructions.push('');
    instructions.push('📖 See /docs/STUDYHUB_QUICKSTART.md for detailed setup instructions');
  }

  return instructions;
}

/**
 * Log environment status to console (for debugging)
 */
export function logEnvironmentStatus(): void {
  const status = getEnvironmentStatus();
  
  console.group('🔧 Environment Configuration Status');
  
  console.log('\n📦 Supabase:');
  if (status.supabase.configured) {
    console.log('  ✅ Configured');
    console.log('  📍 URL:', status.supabase.url);
  } else {
    console.log('  ❌ Not Configured');
    console.log('  ⚠️  Error:', status.supabase.error);
  }
  
  console.log('\n🤖 Perplexity AI:');
  if (status.perplexity.configured) {
    console.log('  ✅ Configured');
  } else {
    console.log('  ❌ Not Configured');
    console.log('  ⚠️  Error:', status.perplexity.error);
  }
  
  console.log('\n📊 Overall Status:', status.overall.toUpperCase());
  
  if (status.overall !== 'complete') {
    console.log('\n🛠️  Setup Instructions:');
    const instructions = getSetupInstructions(status);
    instructions.forEach(instruction => console.log(instruction));
  }
  
  console.groupEnd();
}

/**
 * Check if StudyHub features are available
 */
export function isStudyHubAvailable(): boolean {
  const status = getEnvironmentStatus();
  return status.supabase.configured && status.perplexity.configured;
}

/**
 * Get user-friendly status message
 */
export function getStatusMessage(status: EnvironmentStatus): string {
  switch (status.overall) {
    case 'complete':
      return '✅ All features are available! StudyHub is ready to use.';
    case 'partial':
      if (status.supabase.configured && !status.perplexity.configured) {
        return '⚠️ Supabase is configured, but Perplexity API is missing. AI features will not work.';
      }
      if (!status.supabase.configured && status.perplexity.configured) {
        return '⚠️ Perplexity API is configured, but Supabase is missing. Data persistence will not work.';
      }
      return '⚠️ Partial configuration detected. Some features may not work.';
    case 'missing':
      return '❌ Configuration missing. Please set up your environment variables.';
    default:
      return '❓ Unknown configuration status.';
  }
}
