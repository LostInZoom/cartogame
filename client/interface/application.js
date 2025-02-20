import Page from './page.js';
import { makeDiv, addSVG, addClass, hasClass, removeClass, wait } from '../utils/dom.js';
import { GameMap, MenuMap } from '../cartography/map.js';
import { Content, Footer, Header } from './elements.js';
import { ConsentForm, Form } from './forms.js';

class Application {
    constructor(params) {
        this.params = params;

        // Create the DOM Element
        this.container = makeDiv('application', 'application ' + this.params.interface.theme);
        document.body.append(this.container);

        // Boolean to flag if the page is sliding
        this.sliding = false;
        
        // Storage fot the previous page
        this.previous = new Page(this, 'previous');
        // Create the current page
        this.current = new Page(this, 'current');
        // Create the next page
        this.next = new Page(this, 'next');

        this.title(this.current);
    }

    title(page) {
        let header = new Header(page);
        header.right();
        let content = new Content(page);

        let themeButton = makeDiv(null, 'button-theme button', null);
        addSVG(themeButton, new URL('../img/theme.svg', import.meta.url));
        themeButton.addEventListener('click', () => { this.switchTheme(); });
        header.append(themeButton);

        let title = makeDiv(null, 'title', 'Cartogame');
        let startButton = makeDiv(null, 'button-start button-menu button ' + this.params.interface.theme, 'Play');
        content.append(title, startButton);

        page.themed.push(startButton);
        startButton.addEventListener('click', () => {
            if (!this.sliding) {
                this.consent(this.next);
                this.slideNext(() => {
                    this.next = new Page(this, 'next');
                });
            }
        });
    }

    consent(page) {
        let header = new Header(page);
        let content = new Content(page);

        let backButton = makeDiv(null, 'button-back button-menu button ' + this.params.interface.theme, 'Menu');
        let title = makeDiv(null, 'header-title', 'Consent form');
        let themeButton = makeDiv(null, 'button-theme button', null);
        addSVG(themeButton, new URL('../img/theme.svg', import.meta.url));
        themeButton.addEventListener('click', () => { this.switchTheme(); });

        header.append(backButton, title, themeButton);

        let footer = new Footer(page);
        let form = new ConsentForm(page, content, footer);

        let continueButton = makeDiv(null, 'button-menu button ' + this.params.interface.theme, 'Continue');
        footer.append(continueButton)

        page.themed.push(backButton, continueButton);

        continueButton.addEventListener('click', () => {
            if (form.isChecked()) {
                if (!this.sliding) {
                    this.form(this.next);
                    this.slideNext(() => {
                        this.next = new Page(this, 'next');
                    });
                }
            }
        });

        backButton.addEventListener('click', () => {
            if (!this.sliding) {
                this.title(this.previous);
                this.slidePrevious(() => {
                    this.previous = new Page(this, 'previous');
                });
            }
        });
    }

    form(page) {
        let header = new Header(page);
        let content = new Content(page);
        let footer = new Footer(page);

        let themeButton = makeDiv(null, 'button-theme button', null);
        addSVG(themeButton, new URL('../img/theme.svg', import.meta.url));
        themeButton.addEventListener('click', () => { this.switchTheme(); });

        
        let form = new Form(page, content, footer);

        let questions = this.params.form;
        form.add(...questions);

        let backButton = makeDiv(null, 'button-back button-menu button ' + this.params.interface.theme, 'Menu');
        header.append(backButton, themeButton);

        let continueButton = makeDiv(null, 'button-menu button ' + this.params.interface.theme, 'Validate and continue');
        footer.append(continueButton);

        page.themed.push(backButton, continueButton);

        backButton.addEventListener('click', () => {
            if (!this.sliding) {
                this.title(this.previous);
                this.slidePrevious(() => {
                    this.previous = new Page(this, 'previous');
                });
            }
        });

        continueButton.addEventListener('click', () => {
            if (!this.sliding) {
                this.levels(this.next);
                this.slideNext(() => {
                    this.next = new Page(this, 'next');
                });
            }
        });
    }

    levels(page) {
        let header = new Header(page);
        let content = new Content(page);

        let backButton = makeDiv(null, 'button-back button-menu button ' + this.params.interface.theme, 'Menu');
        header.append(backButton);
        page.themed.push(backButton);

        let themeButton = makeDiv(null, 'button-theme button', null);
        addSVG(themeButton, new URL('../img/theme.svg', import.meta.url));
        themeButton.addEventListener('click', () => { this.switchTheme(); });
        header.append(themeButton);

        let tutorialButton = makeDiv(null, 'button-menu button ' + this.params.interface.theme, 'Tutorial');
        content.append(tutorialButton);
        page.themed.push(tutorialButton);

        let levelcontainer = makeDiv(null, 'level-selection');
        content.append(levelcontainer);

        let levels = this.params.levels;
        for (let i = 0; i < levels.length; i++) {
            let levelbutton = makeDiv(null, 'button-level button inactive ' + this.params.interface.theme, i + 1);
            levelcontainer.append(levelbutton);
            levelbutton.addEventListener('click', () => {
                if (!this.sliding && !hasClass(levelbutton, 'inactive')) {
                    this.startGame(this.next, i);
                    this.slideNext(() => {
                        this.next = new Page(this, 'next');
                    });
                }
            });
            page.themed.push(levelbutton);
        }

        tutorialButton.addEventListener('click', () => {
            if (!this.sliding) {
                this.tutorial2(this.next);
                this.slideNext(() => {
                    this.next = new Page(this, 'next');
                });
            }
        });

        backButton.addEventListener('click', () => {
            if (!this.sliding) {
                this.title(this.previous);
                this.slidePrevious(() => {
                    this.previous = new Page(this, 'previous');
                });
            }
        });
    }

    tutorial1(page) {
        addClass(page.container, 'tutorial');
        
        let menumap = new MenuMap(page);
        menumap.layers.add('player', 50);
        menumap.map.addLayer(menumap.layers.getLayer('player'));

        menumap.setCenter(this.params.tutorial.player);
        menumap.setZoom(16);
        menumap.setGeometry('player', this.params.tutorial.player);

        let information = makeDiv(null, 'tutorial-information');
        let title = makeDiv(null, 'tutorial-title', 'Phase 1');

        let text = makeDiv(null, 'tutorial-text', `
            You must find your location on the map
            following the information on screen.<br><br>
            Hints are updated during the search if you
            are heading in the right direction.<br><br>
            Double tap on the screen when you have found the location,
            a visual let you know if you're wrong.
            `)

        let continueButton = makeDiv(null, 'button-menu button ' + this.params.interface.theme, 'Try it now!');
        information.append(title, text, continueButton);
        page.container.append(information);

        continueButton.addEventListener('click', () => {
            if (!this.sliding) {
                this.phase1(this.next);
                this.slideNext(() => {
                    this.next = new Page(this, 'next');
                });
            }
        });
    }

    phase1(page) {
        let gamemap = new GameMap(page);
        gamemap.setCenter(this.params.tutorial.start.center);
        gamemap.setZoom(this.params.tutorial.start.zoom);
    }

    tutorial2(page) {
        addClass(page.container, 'tutorial');
        let menumap = new MenuMap(page);

        menumap.layers.add('player', 50);
        menumap.map.addLayer(menumap.layers.getLayer('player'));
        menumap.setGeometry('player', this.params.tutorial.player);

        menumap.layers.add('target', 51);
        menumap.map.addLayer(menumap.layers.getLayer('target'));
        menumap.setGeometry('target', this.params.tutorial.target);

        menumap.layers.add('pitfalls', 49);
        menumap.map.addLayer(menumap.layers.getLayer('pitfalls'));
        for (let i = 0; i < this.params.tutorial.pitfalls.length; i++) {
            let p = this.params.tutorial.pitfalls[i];
            menumap.addPoint('pitfalls', p);
        }

        menumap.setCenter(menumap.getCenterForData());
        menumap.setZoom(menumap.getZoomForData(20));

        let information = makeDiv(null, 'tutorial-information');
        let title = makeDiv(null, 'tutorial-title', 'Phase 2 - The journey');

        let text = makeDiv(null, 'tutorial-text', `
            Now that you found your location on the map, you must travel to your
            destination (in green) while avoiding pitfalls (in red) on the way.
            `)

        let continueButton = makeDiv(null, 'button-menu button ' + this.params.interface.theme, 'Continue');
        information.append(title, text, continueButton);
        page.container.append(information);

        continueButton.addEventListener('click', () => {
            if (!this.sliding) {
                this.tutorial3(this.next);
                this.slideNext(() => {
                    this.next = new Page(this, 'next');
                });
            }
        });
    }

    tutorial3(page) {
        addClass(page.container, 'tutorial');
        let menumap = new MenuMap(page);

        let information = makeDiv(null, 'tutorial-information');
        let title = makeDiv(null, 'tutorial-title', 'Phase 2 - The journey');

        let text = makeDiv(null, 'tutorial-text', `
            Now that you found your location on the map, you must travel to your
            destination (in green) while avoiding pitfalls (in red) on the way.
            `)

        let continueButton = makeDiv(null, 'button-menu button ' + this.params.interface.theme, 'Continue');
        information.append(title, text, continueButton);
        page.container.append(information);

        continueButton.addEventListener('click', () => {
            if (!this.sliding) {
                this.page2(this.next);
                this.slideNext(() => {
                    this.next = new Page(this, 'next');
                });
            }
        });

        menumap.layers.add('player', 50);
        menumap.map.addLayer(menumap.layers.getLayer('player'));
        menumap.setGeometry('player', this.params.tutorial.player);

        menumap.layers.add('pitfallsArea', 49);
        menumap.map.addLayer(menumap.layers.getLayer('pitfallsArea'));
        for (let i = 0; i < this.params.tutorial.pitfalls.length; i++) {
            if (i > 1) { break; }
            let p = this.params.tutorial.pitfalls[i];
            menumap.addZone('pitfallsArea', p, this.params.game.tolerance.pitfall);
        }

        menumap.setCenter(menumap.getCenterForData());
        menumap.setZoom(menumap.getZoomForData(30));
    }

    phase2(page) {
        let gamemap = new GameMap(page);
        gamemap.setCenter(this.params.tutorial.start.center);
        gamemap.setZoom(this.params.tutorial.start.zoom);

        gamemap.doubleClick(() => {
            
        });
    }

    startGame(page, index) {
        let options = this.params.levels[index]
        let gamemap = new GameMap(page, options);
        // gamemap.phase1(() => {
        //     gamemap.phase2(() => {

        //     });
        // });
        gamemap.phase2(() => {

        });
    }

    getTheme() {
        if (hasClass(this.container, 'theme-dark')) { return 'theme-dark' }
        else { return 'theme-light' }
    }

    switchTheme() {
        if ( this.getTheme() === 'theme-dark' ) { this.light(); }
        else { this.dark(); }
    }

    light() {
        removeClass(this.container, 'theme-dark');
        addClass(this.container, 'theme-light');
        this.previous.light();
        this.current.light();
        this.next.light();
        this.params.interface.theme = 'theme-light';
    }

    dark() {
        removeClass(this.container, 'theme-light');
        addClass(this.container, 'theme-dark');
        this.previous.dark();
        this.current.dark();
        this.next.dark();
        this.params.interface.theme = 'theme-dark';
    }

    slideNext(callback) {
        if (!this.sliding) {
            this.sliding = true;

            this.next.setCurrent();
            this.current.setPrevious();

            this.previous = this.current;
            this.current = this.next;

            wait(this.params.interface.transition.page, () => {
                this.previous.clear();
                this.container.firstChild.remove();
                this.sliding = false;
                callback();
            })
        }
    }

    slidePrevious(callback) {
        this.sliding = true;

        this.previous.setCurrent();
        this.current.setNext();
        
        this.next = this.current;
        this.current = this.previous;

        wait(this.params.interface.transition.page, () => {
            this.next.clear();
            this.container.lastChild.remove();
            this.sliding = false;
            callback();
        })
    }
}

export default Application;