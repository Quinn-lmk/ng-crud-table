import {DataSource, RequestMetadata} from './types';
import {Row, Filter} from '../../ng-data-table';
import {DataTable} from '../../ng-data-table/base/data-table';
import {ColumnBase} from '../../ng-data-table/base/column-base';
import {CdtSettings} from './cdt-settings';
import {Message} from '../../ng-data-table/base/message';

export class DataManager extends DataTable {

  settings: CdtSettings;
  service: DataSource;
  errors: any;
  item: any;
  refreshRowOnSave: boolean;
  pagerCache: any = {};

  constructor(columns: ColumnBase[], settings: CdtSettings, dataSource: DataSource, messages?: Message) {
    super(columns, settings, messages);
    this.settings = new CdtSettings(settings);
    this.settings.clientSide = false;
    this.setService(dataSource);
  }

  set filters(val: Filter) {
    this.dataFilter.filters = val;
    this.events.onFilter();
  }

  get filters(): Filter {
    return this.dataFilter.filters;
  }

  setService(service: DataSource) {
    this.service = service;
    this.service.primaryKeys = this.columns.filter(col => col.isPrimaryKey).map(col => col.name);
  }

  loadItems() {
    this.getItems(this.settings.virtualScroll).then();
  }

  getItems(concatRows: boolean = false): Promise<any> {
    if (concatRows === true && this.pagerCache[this.pager.current]) {
      return Promise.resolve();
    }
    this.events.onLoading(true);
    this.errors = null;
    this.rowGroup.setSortMetaGroup();
    const requestMeta = <RequestMetadata> {
      pageMeta: {currentPage: this.pager.current, perPage: this.pager.perPage},
      filters: this.dataFilter.filters,
      sortMeta: this.sorter.sortMeta,
      globalFilterValue: this.dataFilter.globalFilterValue,
    };

    return this.service
      .getItems(requestMeta)
      .then(data => {
        this.events.onLoading(false);
        this.rows = (concatRows) ? this.rows.concat(data.items) : data.items;
        if (concatRows) {
          this.pager.total = (data._meta.totalCount > this.rows.length) ? this.rows.length + 1 : this.rows.length;
        } else {
          this.pager.total = data._meta.totalCount;
        }
        this.pager.perPage = data._meta.perPage;
        this.pagerCache[this.pager.current] = true;
      })
      .catch(error => {
        this.events.onLoading(false);
        this.errors = error;
      });
  }

  create(row: Row) {
    this.events.onLoading(true);
    this.errors = null;
    this.service
      .post(row)
      .then(res => {
        this.events.onLoading(false);
        this.errors = null;
        this.addRow(res || row);
      })
      .catch(error => {
        this.events.onLoading(false);
        this.errors = error;
      });
  }

  update(row: Row) {
    this.events.onLoading(true);
    this.errors = null;
    this.service.put(row)
      .then(res => {
        this.events.onLoading(false);
        this.errors = null;
        this.afterUpdate(row, res);
      })
      .catch(error => {
        this.events.onLoading(false);
        this.errors = error;
      });
  }

  delete(row: Row) {
    this.events.onLoading(true);
    this.errors = null;
    this.service
      .delete(row)
      .then(res => {
        this.events.onLoading(false);
        this.errors = null;
        this.deleteRow(row);
      })
      .catch(error => {
        this.events.onLoading(false);
        this.errors = error;
      });
  }

  afterUpdate(row: Row, result: any) {
    if (this.refreshRowOnSave) {
      this.refreshRow(row);
    } else {
      this.mergeRow(row, result || row);
    }
  }

  refreshRow(row: Row) {
    this.events.onLoading(true);
    this.errors = null;
    this.service.getItem(row)
      .then(data => {
        this.events.onLoading(false);
        this.mergeRow(row, data);
      })
      .catch(error => {
        this.events.onLoading(false);
        this.errors = error;
      });
  }

  clear() {
    this.rows = [];
    this.pager.total = 0;
  }

  rowIsValid(row: Row) {
    const hasError = this.columns.some(x => {
      const errors = x.validate(row[x.name]);
      return (errors && errors.length > 0);
    });
    return !hasError;
  }

}
