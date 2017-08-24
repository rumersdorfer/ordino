/**
 * Created by Holger Stitz on 27.07.2016.
 */

import {IDType, resolve} from 'phovea_core/src/idtype';
import {Targid} from './Targid';
import {INamedSet} from 'tdp_core/src/storage';
import {list as listPlugins} from 'phovea_core/src/plugin';
import * as d3 from 'd3';
import {IStartMenuSection, EXTENSION_POINT_START_MENU, IStartMenuSectionDesc} from './extensions';

export interface IStartMenuOptions {
  targid: Targid;
}

function byPriority(a: any, b: any) {
  return (a.priority || 10) - (b.priority || 10);
}

const template = `<button class="closeButton">
      <i class="fa fa-times" aria-hidden="true"></i>
      <span class="sr-only">Close</span>
    </button>
    <div class="menu"></div>`;

export default class StartMenu {

  private readonly $node: d3.Selection<any>;
  private entryPoints: IStartMenuSection[] = [];
  protected $sections;

  /**
   * Save an old key down listener to restore it later
   */
  private restoreKeyDownListener: (ev: KeyboardEvent) => any;

  constructor(parent: Element, private readonly targid: Targid) {
    this.$node = d3.select(parent);
    this.build();
  }

  /**
   * Opens the start menu and attaches an key down listener, to close the menu again pressing the ESC key
   */
  open() {
    this.restoreKeyDownListener = document.onkeydown;
    document.onkeydown = (evt) => {
      evt = evt || <KeyboardEvent>window.event;
      if (evt.keyCode === 27) {
        this.close();
      }
    };
    this.$node.classed('open', true);

    this.updateSections();
  }

  /**
   * Close the start menu and restore an old key down listener
   */
  close() {
    document.onkeydown = this.restoreKeyDownListener;
    this.$node.classed('open', false);
  }

  /**
   * Update entry point list for a given idType and an additional namedSet that should be appended
   * @param idType
   * @param namedSet
   */
  updateEntryPointList(idType: IDType | string, namedSet: INamedSet) {
    const resolved = resolve(idType);
    this.entryPoints
      .map((d) => d.getEntryPointLists())
      .filter((d) => d !== null && d !== undefined)
      .reduce((a, b) => a.concat(b), []) // [[0, 1], [2, 3], [4, 5]] -> [0, 1, 2, 3, 4, 5]
      .filter((d) => d.getIdType() === resolved.id)
      .forEach((d) => {
        d.push(namedSet);
      });
  }

  /**
   * Build multiple sections with entries grouped by database
   */
  private build() {
    const that = this;

    this.$node.html(template);

    this.$node.on('click', () => {
      if ((<Event>d3.event).currentTarget === (<Event>d3.event).target) {
        this.close();
      }
    });

    this.$node.select('.closeButton').on('click', () => {
      // prevent changing the hash (href)
      (<Event>d3.event).preventDefault();

      this.close();
    });

    const sectionEntries = listPlugins(EXTENSION_POINT_START_MENU).map((d) => <IStartMenuSectionDesc>d).sort(byPriority);

    this.$sections = this.$node.select('.menu').selectAll('section').data(sectionEntries);

    this.$sections.enter()
      .append('section')
      .attr('class', (d) => d.cssClass)
      .html((d, i) => `
        <header><h1><label for="${d.cssClass}Toggle">${d.name}</label></h1></header>
        <input id="${d.cssClass}Toggle" class="toggle" type="radio" name="toggle" ${i === 0 ? 'checked="checked"' : ''} />
        <main>
            <div class="item">
              <div class="body">
                <div class="loading">
                  <i class="fa fa-spinner fa-pulse fa-fw"></i>
                  <span class="sr-only">Loading...</span>
                </div>
              </div>
            </div>
        </main>
      `);

    // do not update here --> will be done on first call of open()
    //this.updateSections();
  }

  private hasEntryPoint(section: IStartMenuSectionDesc) {
    // do not load entry point again, if already loaded
    return this.entryPoints.find((ep) => ep.desc.id === section.id) != null;
  }

  /**
   * Loops through all sections and updates them (or the entry points) if necessary
   */
  private updateSections() {
    const that = this;

    this.$sections.each(async function (section: IStartMenuSectionDesc) {
      // reload the entry points every time the
      const elem = <HTMLElement>this.querySelector('div.body');

      // do not load entry point again, if already loaded
      if (that.hasEntryPoint(section)) {
        return;
      }

      const entryPoint = (await section.load()).factory(elem, section, {session: that.targid.initNewSession.bind(that.targid)});
      // prevent adding the entryPoint if already in list or undefined
      if (entryPoint === undefined || that.hasEntryPoint(section)) {
        return;
      }
      that.entryPoints.push(entryPoint);
    });
  }

}
