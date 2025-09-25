import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Plus, Trash2, Globe, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import backendService from '../services/backendService';

interface BlockedSite {
  id: string;
  url: string;
  created_at: string;
}

interface DistractionBlockerProps {
  user?: any;
}

export function DistractionBlocker({ user }: DistractionBlockerProps) {
  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>([]);
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [isBlockingEnabled, setIsBlockingEnabled] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user's blocked sites and settings
  useEffect(() => {
    const loadDistractionData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Load blocked sites
        const sitesResult = await backendService.distractionBlocker.getBlockedSites(user.id);
        if (sitesResult.data) {
          setBlockedSites(sitesResult.data);
        }

        // Load user settings
        const settingsResult = await backendService.distractionBlocker.getUserSettings(user.id);
        if (settingsResult.data) {
          setIsBlockingEnabled(settingsResult.data.distraction_block_enabled || false);
        }
      } catch (error) {
        console.error('Error loading distraction blocker data:', error);
        toast.error('Failed to load distraction blocker settings');
      } finally {
        setLoading(false);
      }
    };

    loadDistractionData();
  }, [user]);

  const handleToggleBlocking = async (enabled: boolean) => {
    if (!user) {
      toast.error('Please log in to manage distraction blocking');
      return;
    }

    try {
      const result = await backendService.distractionBlocker.updateSettings(user.id, {
        distraction_block_enabled: enabled
      });

      if (result.success) {
        setIsBlockingEnabled(enabled);
        toast.success(enabled ? 'Distraction blocking enabled' : 'Distraction blocking disabled');
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating distraction blocking:', error);
      toast.error('Failed to update settings');
    }
  };

  const handleAddSite = async () => {
    if (!user) {
      toast.error('Please log in to add blocked sites');
      return;
    }

    if (!newSiteUrl.trim()) {
      toast.error('Please enter a website URL');
      return;
    }

    // Clean and validate URL
    let cleanUrl = newSiteUrl.trim().toLowerCase();
    
    // Remove protocol if present
    cleanUrl = cleanUrl.replace(/^https?:\/\//, '');
    
    // Remove www if present
    cleanUrl = cleanUrl.replace(/^www\./, '');
    
    // Remove trailing slash
    cleanUrl = cleanUrl.replace(/\/$/, '');

    // Basic validation
    if (!cleanUrl.includes('.') || cleanUrl.length < 3) {
      toast.error('Please enter a valid website URL (e.g., youtube.com)');
      return;
    }

    // Check if site is already blocked
    const alreadyBlocked = blockedSites.some(site => 
      site.url.toLowerCase() === cleanUrl
    );

    if (alreadyBlocked) {
      toast.error('This site is already blocked');
      return;
    }

    try {
      const result = await backendService.distractionBlocker.addBlockedSite(user.id, cleanUrl);
      
      if (result.success && result.data) {
        setBlockedSites(prev => [...prev, result.data]);
        setNewSiteUrl('');
        setIsAddDialogOpen(false);
        toast.success(`${cleanUrl} added to blocked sites`);
      } else {
        toast.error('Failed to add blocked site');
      }
    } catch (error) {
      console.error('Error adding blocked site:', error);
      toast.error('Failed to add blocked site');
    }
  };

  const handleRemoveSite = async (siteId: string, url: string) => {
    if (!user) {
      toast.error('Please log in to manage blocked sites');
      return;
    }

    try {
      const result = await backendService.distractionBlocker.removeBlockedSite(siteId);
      
      if (result.success) {
        setBlockedSites(prev => prev.filter(site => site.id !== siteId));
        toast.success(`${url} removed from blocked sites`);
      } else {
        toast.error('Failed to remove blocked site');
      }
    } catch (error) {
      console.error('Error removing blocked site:', error);
      toast.error('Failed to remove blocked site');
    }
  };

  // Show auth required state
  if (!user) {
    return (
      <Card className="glassmorphism border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Distraction Blocker
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted/20 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium mb-2">Block Distracting Websites</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add websites to your personal block list and stay focused during study sessions.
              </p>
              <Button 
                onClick={() => {
                  const event = new CustomEvent('navigate-to-login');
                  window.dispatchEvent(event);
                }}
                className="gradient-primary"
              >
                Sign In to Access
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="glassmorphism border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Distraction Blocker
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="w-6 h-6 mx-auto border-2 border-primary-solid border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground mt-2">Loading settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glassmorphism border-0">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Distraction Blocker
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {isBlockingEnabled ? 'Active' : 'Inactive'}
            </span>
            <Switch
              checked={isBlockingEnabled}
              onCheckedChange={handleToggleBlocking}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Indicator */}
        <div className={`flex items-center gap-3 p-3 rounded-lg ${
          isBlockingEnabled 
            ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800' 
            : 'bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800'
        }`}>
          {isBlockingEnabled ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  Distraction blocking is active
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {blockedSites.length} {blockedSites.length === 1 ? 'site' : 'sites'} blocked
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  Distraction blocking is inactive
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  Toggle on to start blocking distracting websites
                </p>
              </div>
            </>
          )}
        </div>

        {/* Add New Site */}
        <div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start gradient-primary text-white border-0">
                <Plus className="w-4 h-4 mr-2" />
                Add Blocked Site
              </Button>
            </DialogTrigger>
            <DialogContent className="glassmorphism">
              <DialogHeader>
                <DialogTitle>Add Website to Block List</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="site-url">Website URL</Label>
                  <Input
                    id="site-url"
                    value={newSiteUrl}
                    onChange={(e) => setNewSiteUrl(e.target.value)}
                    placeholder="e.g., youtube.com, reddit.com, twitter.com"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSite()}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter just the domain name without http:// or www.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddSite} className="gradient-primary flex-1">
                    Add Site
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Blocked Sites List */}
        <div>
          <h4 className="font-medium mb-3">Blocked Sites ({blockedSites.length})</h4>
          {blockedSites.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {blockedSites.map((site) => (
                <motion.div
                  key={site.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium">{site.url}</p>
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(site.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveSite(site.id, site.url)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No sites blocked yet</p>
              <p className="text-sm">Add websites that distract you during study sessions</p>
            </div>
          )}
        </div>

        {/* Implementation Note */}
        <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">How it works:</p>
              <p>Your blocked sites are saved to your account and can be enforced through browser extensions, desktop apps, or network-level blocking depending on your setup.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}