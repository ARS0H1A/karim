// =============================================
// 🪙 CORN CURRENCY SYSTEM - External Module
// =============================================

// 1. Add corn to all users (one-time migration)
function cornMigrate() {
    if (typeof DB === 'undefined') return;
    const db = DB.get();
    let updated = false;
    db.users.forEach(user => {
        if (user.corn === undefined) {
            user.corn = 0;
            updated = true;
        }
    });
    if (updated) {
        DB.save(db);
        console.log('🌽 Corn added to all users!');
    }
}

// 2. Display corn in header (next to username)
function cornUpdateHeader() {
    if (typeof DB === 'undefined') return;
    const user = DB.currentUser();
    const chip = document.querySelector('.user-chip');
    if (!chip || !user) return;
    
    const old = chip.querySelector('.corn-badge');
    if (old) old.remove();
    
    const roleBadge = chip.querySelector('.role-badge');
    if (!roleBadge) return;
    
    const badge = document.createElement('span');
    badge.className = 'corn-badge';
    badge.style.cssText = 'font-size:0.6rem;color:#fbbf24;background:rgba(251,191,36,0.1);padding:0.05rem 0.4rem;border-radius:10px;border:1px solid rgba(251,191,36,0.1);margin-left:0.3rem;';
    badge.innerHTML = '🌽 ' + (user.corn || 0);
    roleBadge.insertAdjacentElement('afterend', badge);
}

// 3. Display corn in shop view
function cornUpdateShop() {
    if (typeof DB === 'undefined') return;
    const user = DB.currentUser();
    let cornAmount = document.getElementById('cornAmount');
    
    if (!cornAmount) {
        const shopView = document.getElementById('view-shop');
        if (!shopView) return;
        
        const filterContainer = shopView.querySelector('[onclick="filterShop(\'all\')"]');
        if (!filterContainer) return;
        
        let parent = filterContainer.parentElement;
        if (!parent) return;
        
        const display = document.createElement('div');
        display.id = 'shop-corn-display';
        display.style.cssText = 'display:flex;align-items:center;justify-content:flex-end;gap:0.5rem;padding:0.5rem 1rem;margin-bottom:1rem;background:rgba(251,191,36,0.05);border:1px solid rgba(251,191,36,0.1);border-radius:12px;font-size:1.1rem;color:#fbbf24;';
        display.innerHTML = '<span style="font-size:1.2rem;">🪙</span><span style="font-weight:600;">Your Corn:</span><span style="font-size:1.3rem;font-weight:700;" id="cornAmount">0</span><span style="font-size:0.7rem;color:var(--text-secondary);margin-left:0.5rem;">(Spend on items & ranks!)</span>';
        
        parent.parentElement.insertBefore(display, parent);
        cornAmount = document.getElementById('cornAmount');
    }
    
    if (cornAmount && user) {
        cornAmount.textContent = user.corn || 0;
    }
}

// 4. Update all corn displays
function cornUpdateAll() {
    cornUpdateHeader();
    cornUpdateShop();
}

// 5. Admin: add corn to user
function addCornToUser(userId, amount) {
    if (typeof DB === 'undefined') return false;
    const db = DB.get();
    const user = db.users.find(u => u.id === userId);
    if (!user) return false;
    user.corn = (user.corn || 0) + amount;
    DB.save(db);
    if (typeof toast === 'function') {
        toast('✅ ' + amount + ' Corn added to ' + user.displayName + '!', 'success');
    }
    return true;
}

// 6. Earn corn from games
function earnCornFromGame(gameName, score) {
    if (typeof DB === 'undefined') return;
    const user = DB.currentUser();
    if (!user) return;
    
    let cornEarned = 0;
    if (gameName === 'snake') {
        cornEarned = Math.floor(score / 10);
    } else if (gameName === 'memory') {
        cornEarned = score * 2;
    } else {
        cornEarned = Math.floor(score / 5);
    }
    
    if (cornEarned > 0) {
        const db = DB.get();
        const u = db.users.find(x => x.id === user.id);
        if (u) {
            u.corn = (u.corn || 0) + cornEarned;
            DB.save(db);
            if (typeof toast === 'function') {
                toast('🌽 You earned ' + cornEarned + ' Corn from ' + gameName + '!', 'success');
            }
            cornUpdateAll();
        }
    }
}

// 7. Purchase with corn
function purchaseWithCorn(itemId, price) {
    if (typeof DB === 'undefined') return false;
    const user = DB.currentUser();
    if (!user) {
        if (typeof toast === 'function') toast('Please log in first!', 'error');
        return false;
    }
    
    if ((user.corn || 0) < price) {
        if (typeof toast === 'function') {
            toast('❌ Not enough Corn! You have ' + (user.corn || 0) + ', need ' + price + '.', 'error');
        }
        return false;
    }
    
    const db = DB.get();
    const u = db.users.find(x => x.id === user.id);
    if (u) {
        u.corn = (u.corn || 0) - price;
        DB.save(db);
        if (typeof toast === 'function') {
            toast('✅ Purchase successful! You spent ' + price + ' Corn.', 'success');
        }
        cornUpdateAll();
        return true;
    }
    return false;
}

// 8. Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            cornMigrate();
            cornUpdateAll();
            
            if (typeof setView === 'function') {
                const origSetView = setView;
                setView = function(view) {
                    origSetView(view);
                    if (view === 'shop') {
                        setTimeout(cornUpdateShop, 100);
                    } else {
                        setTimeout(cornUpdateHeader, 50);
                    }
                };
            }
            
            if (typeof refreshAuthArea === 'function') {
                const origRefresh = refreshAuthArea;
                refreshAuthArea = function() {
                    origRefresh();
                    setTimeout(cornUpdateHeader, 10);
                };
            }
        }, 500);
    });
} else {
    setTimeout(function() {
        cornMigrate();
        cornUpdateAll();
        
        if (typeof setView === 'function') {
            const origSetView = setView;
            setView = function(view) {
                origSetView(view);
                if (view === 'shop') {
                    setTimeout(cornUpdateShop, 100);
                } else {
                    setTimeout(cornUpdateHeader, 50);
                }
            };
        }
        
        if (typeof refreshAuthArea === 'function') {
            const origRefresh = refreshAuthArea;
            refreshAuthArea = function() {
                origRefresh();
                setTimeout(cornUpdateHeader, 10);
            };
        }
    }, 500);
}

console.log('🌽 Corn system loaded!');
