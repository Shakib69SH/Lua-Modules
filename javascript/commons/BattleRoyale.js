liquipedia.battleRoyale = {

	DIRECTION_LEFT: 'left',
	DIRECTION_RIGHT: 'right',
	ICON_SORT: 'fa-arrows-alt-v',
	ICON_SORT_UP: 'fa-long-arrow-alt-up',
	ICON_SORT_DOWN: 'fa-long-arrow-alt-down',
	battleRoyaleInstances: {},
	battleRoyaleMap: {},
	gameWidth: parseFloat( getComputedStyle( document.documentElement ).fontSize ) * 9.25,

	implementOnWindowResize: function( instanceId ) {
		window.addEventListener( 'resize', function() {
			this.battleRoyaleInstances[ instanceId ].querySelectorAll( '[data-js-battle-royale="game-nav-holder"]' )
				.forEach( function( tableEl ) {
					this.recheckSideScrollButtonStates( tableEl );
				}.bind( this ) );
		}.bind(this) );
	},

	implementScrollendEvent: function( instanceId ) {
		if ( !( 'onscrollend' in window ) || typeof window.onscrollend === 'undefined' ) {
			this.battleRoyaleInstances[ instanceId ].querySelectorAll( '[data-js-battle-royale="game-nav-holder"]' )
				.forEach( function( tableEl ) {
					const scrollingEl = tableEl.querySelector( '[data-js-battle-royale="game-container"]' );
					const options = {
						passive: true
					};
					const scrollEnd = this.debounce( function( e ) {
						e.target.dispatchEvent( new CustomEvent( 'scrollend', {
							bubbles: true
						} ) );
					}, 100 );

					scrollingEl.addEventListener( 'scroll', scrollEnd, options );
				}.bind( this ) );
		}
	},

	debounce: function( callback, wait ) {
		let timeout;
		return function( e ) {
			clearTimeout( timeout );
			timeout = setTimeout( function() {
				callback( e );
			}, wait );
		};
	},

	handleTableSideScroll: function( tableElement, direction ) {
		tableElement.querySelectorAll( '.cell--game-container' ).forEach( function( i ) {
			const isNav = i.parentNode.classList.contains( 'cell--game-container-nav-holder' );
			if ( direction === this.DIRECTION_RIGHT ) {
				i.scrollLeft += this.gameWidth;
				if ( isNav ) {
					this.onScrollEndSideScrollButtonStates( tableElement );
				}
			} else {
				i.scrollLeft -= this.gameWidth;
				if ( isNav ) {
					this.onScrollEndSideScrollButtonStates( tableElement );
				}
			}
		}.bind( this ) );
	},

	onScrollEndSideScrollButtonStates: function( tableElement ) {
		tableElement.querySelector( '.cell--game-container' ).addEventListener( 'scrollend', function() {
			this.recheckSideScrollButtonStates( tableElement );
		}.bind( this ), {
			once: true
		} );
	},

	recheckSideScrollButtonStates: function( tableElement ) {
		const navLeft = tableElement.querySelector( '[data-js-battle-royale="navigate-left"]' );
		const navRight = tableElement.querySelector( '[data-js-battle-royale="navigate-right"]' );
		const el = tableElement.querySelector(
			'[data-js-battle-royale="game-nav-holder"] > [data-js-battle-royale="game-container"]'
		);

		const isScrollable = el.scrollWidth > el.offsetWidth;
		// Check LEFT
		if ( isScrollable && el.scrollLeft > 0 ) {
			navLeft.classList.remove( 'd-none' );
		} else {
			navLeft.classList.add( 'd-none' );
		}
		// Check RIGHT
		if ( isScrollable && ( el.offsetWidth + Math.ceil( el.scrollLeft ) ) < el.scrollWidth ) {
			navRight.classList.remove( 'd-none' );
		} else {
			navRight.classList.add( 'd-none' );
		}
	},

	handleNavigationTabChange: function( instanceId, tab ) {
		this.battleRoyaleMap[ instanceId ].navigationTabs.forEach( function( item ) {
			if ( item === tab ) {
				// activate nav tab
				item.classList.add( 'tab--active' );
			} else {
				// deactivate nav tab
				item.classList.remove( 'tab--active' );
			}
		} );
		this.battleRoyaleMap[ instanceId ].navigationContents.forEach( function( content ) {
			if ( content.dataset.jsBattleRoyaleContentId === tab.dataset.targetId ) {
				// activate nav tab content
				content.classList.remove( 'is--hidden' );
			} else {
				// deactivate nav tab content
				content.classList.add( 'is--hidden' );
			}
		} );
	},

	handlePanelTabChange: function( instanceId, contentId, panelTab ) {
		const tabs = this.battleRoyaleMap[ instanceId ].navigationContentPanelTabs[ contentId ];
		tabs.forEach( function( item ) {
			if ( item === panelTab ) {
				// activate content tab
				item.classList.add( 'is--active' );
			} else {
				// deactivate content tab
				item.classList.remove( 'is--active' );
			}
		} );
		const contents = this.battleRoyaleMap[ instanceId ].navigationContentPanelTabContents[ contentId ];
		Object.keys( contents ).forEach( function( panelId ) {
			if ( panelId === panelTab.dataset.jsBattleRoyaleContentTargetId ) {
				// activate content tab panel
				contents[ panelId ].classList.remove( 'is--hidden' );
			} else {
				// deactivate content tab panel
				contents[ panelId ].classList.add( 'is--hidden' );
			}
		} );
	},

	buildBattleRoyaleMap: function( id ) {
		this.battleRoyaleMap[ id ] = {
			navigationTabs: Array.from(
				this.battleRoyaleInstances[ id ].querySelectorAll( '[data-js-battle-royale="navigation-tab"]' ) ),
			navigationContents: Array.from(
				this.battleRoyaleInstances[ id ].querySelectorAll( '[data-js-battle-royale-content-id]' ) ),
			navigationContentPanelTabs: {},
			navigationContentPanelTabContents: {},
			collapsibles: []
		};

		this.battleRoyaleMap[ id ].navigationContents.forEach( function( content ) {
			const brContentId = content.dataset.jsBattleRoyaleContentId;
			this.battleRoyaleMap[ id ].navigationContentPanelTabs[ brContentId ] =
				Array.from( content.querySelectorAll( '[data-js-battle-royale="panel-tab"]' ) );

			this.battleRoyaleMap[ id ].navigationContentPanelTabs[ brContentId ].forEach( function( node ) {
				// Create object keys
				if ( !( brContentId in this.battleRoyaleMap[ id ].navigationContentPanelTabContents ) ) {
					this.battleRoyaleMap[ id ].navigationContentPanelTabContents[ brContentId ] = {};
				}
				this.battleRoyaleMap[ id ]
					.navigationContentPanelTabContents[ brContentId ][ node.dataset.jsBattleRoyaleContentTargetId ] =
					content.querySelector( '#' + node.dataset.jsBattleRoyaleContentTargetId );

				// Query all collapsible elements and push it to the array
				const collapsibleElements = this.battleRoyaleMap[ id ]
					.navigationContentPanelTabContents[ brContentId ][ node.dataset.jsBattleRoyaleContentTargetId ]
					.querySelectorAll( '[data-js-battle-royale="collapsible"]' );

				this.battleRoyaleMap[ id ].collapsibles.push( ...collapsibleElements );
			}.bind( this ) );
		}.bind( this ) );
	},

	attachHandlers: function( id ) {
		this.battleRoyaleMap[ id ].navigationTabs.forEach( function( tab ) {
			tab.addEventListener( 'click', function() {
				this.handleNavigationTabChange( id, tab );
			}.bind( this ) );
		}.bind( this ) );

		Object.keys( this.battleRoyaleMap[ id ].navigationContentPanelTabs ).forEach( function( contentId ) {
			this.battleRoyaleMap[ id ].navigationContentPanelTabs[ contentId ].forEach( function( panelTab ) {
				panelTab.addEventListener( 'click', function() {
					this.handlePanelTabChange( id, contentId, panelTab );
				}.bind( this ) );
			}.bind( this ) );
		}.bind( this ) );
	},

	makeCollapsibles: function ( id ) {
		this.battleRoyaleMap[ id ].collapsibles.forEach( function( element ) {
			const button = element.querySelector( '[data-js-battle-royale="collapsible-button"]' );
			if ( button && element ) {
				button.addEventListener( 'click', function() {
					element.classList.toggle( 'is--collapsed' );
				} );
			}
		} );
	},

	createNavigationElement: function( dir ) {
		const element = document.createElement( 'div' );
		element.classList.add( 'panel-table__navigate', 'navigate--' + dir );
		element.setAttribute( 'data-js-battle-royale', 'navigate-' + dir );

		const icon = document.createElement( 'i' );
		icon.classList.add( 'fas', `fa-chevron-${ dir }` );
		element.append( icon );
		return element;
	},

	makeSideScrollElements: function( id ) {
		this.battleRoyaleInstances[ id ].querySelectorAll( '[data-js-battle-royale="table"]' ).forEach( function( table ) {
			const navHolder = table.querySelector( '.row--header > .cell--game-container-nav-holder' );
			if ( navHolder ) {
				for ( const dir of [ this.DIRECTION_LEFT, this.DIRECTION_RIGHT ] ) {
					const element = this.createNavigationElement( dir );
					element.addEventListener( 'click', function() {
						this.handleTableSideScroll( table, dir );
					}.bind( this ) );
					navHolder.appendChild( element );
				}
				this.recheckSideScrollButtonStates( navHolder );
			}
		}.bind( this ) );

	},

	getSortingIcon: function( element ) {
		return element.querySelector( '[data-js-battle-royale="sort-icon"]' );
	},

	changeButtonStyle: function( button, order = 'default' ) {
		const sortingOrder = {
			ascending: this.ICON_SORT_DOWN,
			descending: this.ICON_SORT_UP,
			default: this.ICON_SORT
		};

		button.setAttribute( 'data-order', order );

		const sortIcon = this.getSortingIcon( button );
		sortIcon.removeAttribute( 'class' );
		sortIcon.classList.add( 'far', sortingOrder[ order ] );
	},

	comparator: function ( a, b, dir = 'ascending', sortType = 'team' ) {
		const valA = a.querySelector( `[data-sort-type='${ sortType }']` ).dataset.sortVal;
		const valB = b.querySelector( `[data-sort-type='${ sortType }']` ).dataset.sortVal;
		if ( dir === 'ascending' ) {
			return valB > valA ? -1 : ( valA > valB ? 1 : 0 );
		} else {
			return valB < valA ? -1 : ( valA < valB ? 1 : 0 );
		}
	},

	makeSortableTable: function( instance ) {
		const sortButtons = instance.querySelectorAll( '[data-js-battle-royale="header-row"] > [data-sort-type]' );

		sortButtons.forEach( function( button ) {
			button.addEventListener( 'click', function() {

				const sortType = button.dataset.sortType;
				const table = button.closest( '[data-js-battle-royale="table"]' );
				const sortableRows = Array.from( table.querySelectorAll( '[data-js-battle-royale="row"]' ) );

				/**
				 * Check on dataset for descending/ascending order
				 */
				const expr = button.getAttribute( 'data-order' );
				const newOrder = expr === 'ascending' ? 'descending' : 'ascending';
				for ( const b of sortButtons ) {
					this.changeButtonStyle( b, 'default' );
				}
				this.changeButtonStyle( button, newOrder );
				const sorted = sortableRows.sort( function( a, b ) {
					return this.comparator( a, b, newOrder, sortType );
				}.bind( this ) );

				sorted.forEach( function( element, index ) {
					if ( element.style.order ) {
						element.style.removeProperty( 'order' );
					}
					element.style.order = index.toString();
				} );
			} );
		} );
	},

	createBottomNav( instanceId, navigationTab, currentPanelIndex ) {
		// eslint-disable-next-line es-x/no-object-values
		const contentPanel = Object.values(
			this.battleRoyaleMap[ instanceId ].navigationContentPanelTabContents[ navigationTab ]
		)[ currentPanelIndex ];
		const navPanels = this.battleRoyaleMap[ instanceId ].navigationContentPanelTabs[ navigationTab ];
		if ( navPanels.length <= 1 ) {
			return;
		}

		const element = document.createElement( 'div' );
		element.classList.add( 'panel-content__bottom-navigation' );
		element.setAttribute( 'data-js-battle-royale', 'bottom-nav' );
		if ( currentPanelIndex !== 0 ) {
			element.append(
				this.createBottomNavLink(
					instanceId, navigationTab, navPanels[ currentPanelIndex - 1 ], this.DIRECTION_LEFT
				)
			);
		}
		if ( currentPanelIndex < navPanels.length - 1 ) {
			element.append(
				this.createBottomNavLink(
					instanceId, navigationTab, navPanels[ currentPanelIndex + 1 ], this.DIRECTION_RIGHT
				)
			);
		}
		contentPanel.append( element );
	},

	createBottomNavLink: function( instanceId, navigationTab, destinationPanel, direction = this.DIRECTION_LEFT ) {
		const element = document.createElement( 'div' );
		element.classList.add( 'panel-content__bottom-navigation__link', `navigate--${ direction }` );
		element.setAttribute( 'data-js-battle-royale', `bottom-nav-${ direction }` );
		element.setAttribute( 'tabindex', '0' );

		const textElement = document.createElement( 'span' );
		textElement.setAttribute( 'data-js-battle-royale', `bottom-nav-${ direction }-text` );
		textElement.innerText = destinationPanel.innerText;

		const icon = document.createElement( 'i' );
		icon.classList.add( 'fas', `fa-arrow-${ direction }`, 'panel-content__bottom-navigation__icon' );
		icon.setAttribute( 'data-js-battle-royale', `bottom-nav-${ direction }-icon` );
		element.append( textElement, icon );

		element.addEventListener( 'click', function() {
			this.handlePanelTabChange( instanceId, navigationTab, destinationPanel );
		}.bind( this ) );

		return element;
	},

	init: function() {
		Array.from( document.querySelectorAll( '[data-js-battle-royale-id]' ) ).forEach( function( instance ) {
			this.battleRoyaleInstances[ instance.dataset.jsBattleRoyaleId ] = instance;

			this.makeSortableTable( instance );
		}.bind( this ) );

		Object.keys( this.battleRoyaleInstances ).forEach( function( instanceId ) {
			// create object based on id
			this.buildBattleRoyaleMap( instanceId );

			this.attachHandlers( instanceId );
			this.makeCollapsibles( instanceId );
			this.makeSideScrollElements( instanceId );

			// load the first tab for nav tabs and content tabs of all nav tabs
			this.handleNavigationTabChange( instanceId, this.battleRoyaleMap[ instanceId ].navigationTabs[ 0 ] );
			this.battleRoyaleMap[ instanceId ].navigationTabs.forEach( function( navTab ) {
				const target = navTab.dataset.targetId;
				const panels = this.battleRoyaleMap[ instanceId ].navigationContentPanelTabs[ target ];

				if ( target && Array.isArray( panels ) && panels.length ) {
					// Set on first panel on init
					this.handlePanelTabChange( instanceId, target, panels[ 0 ] );
				}

				panels.forEach( function ( panel, index ) {
					this.createBottomNav( instanceId, target, index );
				}.bind( this ) );

			}.bind( this ) );

			this.implementScrollendEvent( instanceId );
			this.implementOnWindowResize( instanceId );

		}.bind( this ) );
	}
};
liquipedia.core.modules.push( 'battleRoyale' );
liquipedia.battleRoyale.init();
