/**
 * jQuery.ddMM.mm_ddMultipleFields
 * @version 2.0 (2016-11-16)
 * 
 * @uses jQuery 1.9.1
 * @uses jQuery.ddTools 1.8.1
 * @uses jQuery.ddMM 1.1.2
 * 
 * @copyright 2013–2014 [DivanDesign]{@link http://www.DivanDesign.biz }
 */

(function($){
$.ddMM.mm_ddMultipleFields = {
	defaults: {
		//Разделитель строк
		rowDelimiter: '||',
		//Разделитель колонок
		colDelimiter: '::',
		//Колонки
		columns: 'field',
		//Заголовки колонок
		columnsTitles: '',
		//Данные колонок
		columnsData: '',
		//Ширины колонок
		columnsWidth: '180',
		//Стиль превьюшек
		previewStyle: '',
		//Минимальное количество строк
		minRowsNumber: 0,
		//Максимальное количество строк
		maxRowsNumber: 0
	},
//	Все экземпляры (TV). Структура: {
//		'id': {
//			currentField,
//			$addButton,
//			+Всё, что передано параметрально (см. this.defaults)
//		}
//	}
	instances: {},
	richtextWindow: null,
	
	/**
	 * @method updateField
	 * @version 1.0 (2014-10-23)
	 * 
	 * @desc Обновляет мульти-поле, берёт значение из оригинального поля.
	 * 
	 * @param id {string} — TV id.
	 * 
	 * @returns {void}
	 */
	updateField: function(id){
		var _this = this;
		
		//Если есть текущее поле
		if (_this.instances[id].currentField){
			//Задаём значение текущему полю (берём у оригинального поля), запускаем событие изменения
			_this.instances[id].currentField.val($.trim($('#' + id).val())).trigger('change.ddEvents');
			//Забываем текущее поле (ибо уже обработали)
			_this.instances[id].currentField = false;
		}
	},
	
	/**
	 * @method updateTv
	 * @version 1.0.1 (2016-11-16)
	 * 
	 * @desc Обновляет оригинальное поле TV, собирая данные по мульти-полям.
	 * 
	 * @param id {string} — TV id.
	 * 
	 * @returns {void}
	 */
	updateTv: function(id){
		var _this = this,
			masRows = new Array();
		
		//Перебираем все строки
		$('#' + id + 'ddMultipleField .ddFieldBlock').each(function(){
			var $this = $(this),
				masCol = new Array(),
				id_field = {
					index: false,
					val: false,
					$field: false
				};
			
			//Перебираем все колонки, закидываем значения в массив
			$this.find('.ddField').each(function(index){
				//Если поле с типом id TODO: Какой смысл по всех этих манипуляциях?
				if (_this.instances[id].columns[index] == 'id'){
					id_field.index = index;
					id_field.$field = $(this);
					
					//Сохраняем значение поля
					id_field.val = id_field.$field.val();
					//Если значение пустое, то генерим
					if (id_field.val == ''){id_field.val = (new Date).getTime();}
					
					//Обнуляем значение
					id_field.$field.val('');
				}
				
				//Если колонка типа richtext
				if (_this.instances[id].columns[index] == 'richtext'){
					//Собираем значения строки в массив
					masCol.push($.trim($(this).html()));
				}else{
					//Собираем значения строки в массив
					masCol.push($.trim($(this).val()));
				}
			});
			
			//Склеиваем значения колонок через разделитель
			var col = masCol.join(_this.instances[id].colDelimiter);
			
			//Если значение было хоть в одной колонке из всех в этой строке
			if (col.length != ((masCol.length - 1) * _this.instances[id].colDelimiter.length)){
				//Проверяем было ли поле с id
				if (id_field.index !== false){
					//Записываем значение в поле
					id_field.$field.val(id_field.val);
					//Обновляем значение в массиве
					masCol[id_field.index] = id_field.val;
					//Пересобираем строку
					col = masCol.join(_this.instances[id].colDelimiter);
				}
				
				masRows.push(col);
			}
		});
		
		//Записываем значение в оригинальное поле
		$('#' + id).val(masRows.join(_this.instances[id].rowDelimiter));
	},
	
	/**
	 * @method init
	 * @version 1.0.1 (2016-11-16)
	 * 
	 * @desc Инициализация.
	 * 
	 * @param id {string} — TV id.
	 * @param val {string} — TV value.
	 * @param target {jQuery} — TV parent.
	 * 
	 * @returns {void}
	 */
	init: function(id, val, target){
		var _this = this,
			//Делаем таблицу мульти-полей, вешаем на таблицу функцию обновления оригинального поля
			$ddMultipleField = $('<table class="ddMultipleField" id="' + id + 'ddMultipleField"></table>').appendTo(target);
		
		//Если есть хоть один заголовок
		if (_this.instances[id].columnsTitles.length > 0){
			var text = '';
			
			//Создадим шапку (перебираем именно колонки!)
			$.each(_this.instances[id].columns, function(key, val){
				//Если это колонка с id
				if (val == 'id'){
					//Вставим пустое значение в массив с заголовками
					_this.instances[id].columnsTitles.splice(key, 0, '');
					
					text += '<th style="display: none;"></th>';
				}else{
					//Если такого значения нет — сделаем
					if (!_this.instances[id].columnsTitles[key]){
						_this.instances[id].columnsTitles[key] = '';
					}
					
					text += '<th>' + (_this.instances[id].columnsTitles[key]) + '</th>';
				}
			});
			
			$('<tr><th></th>' + text + '<th></th></tr>').appendTo($ddMultipleField);
		}
		
		//Делаем новые мульти-поля
		var arr = val.split(_this.instances[id].rowDelimiter);
		
		//Проверяем на максимальное и минимальное количество строк
		if (
			_this.instances[id].maxRowsNumber &&
			arr.length > _this.instances[id].maxRowsNumber
		){
			arr.length = _this.instances[id].maxRowsNumber;
		}else if (
			_this.instances[id].minRowsNumber &&
			arr.length < _this.instances[id].minRowsNumber
		){
			arr.length = _this.instances[id].minRowsNumber;
		}
		
		//Создаём кнопку +
		_this.instances[id].$addButton = _this.makeAddButton(id);
		
		for (
			var i = 0, len = arr.length;
			i < len;
			i++
		){
			//В случае, если размер массива был увеличен по minRowsNumber, значением будет undefined, посему зафигачим пустую строку
			_this.makeFieldRow(id, arr[i] || '');
		}
		
		//Втыкаем кнопку + куда надо
		_this.instances[id].$addButton.appendTo($('#' + id + 'ddMultipleField .ddFieldBlock:last .ddFieldCol:last'));
		
		//Добавляем возможность перетаскивания
		$ddMultipleField.sortable({
			items: 'tr:has(td)',
			handle: '.ddSortHandle',
			cursor: 'n-resize',
			axis: 'y',
			placeholder: 'ui-state-highlight',
			start: function(event, ui){
				ui.placeholder.html('<td colspan="' + (_this.instances[id].columns.length + 2) + '"><div></div></td>').find('div').css('height', ui.item.height());
			},
			stop: function(event, ui){
				//Находим родителя таблицы, вызываем функцию обновления поля
				_this.moveAddButton(id);
			}
		});
	},
	
	/**
	 * @method makeFieldRow
	 * @version 1.0.1 (2016-11-16)
	 * 
	 * @desc Функция создания строки.
	 * 
	 * @param id {string} — TV id.
	 * @param val {string} — Row value.
	 * 
	 * @returns {jQuery}
	 */
	makeFieldRow: function(id, val){
		var _this = this;
		
		//Если задано максимальное количество строк
		if (_this.instances[id].maxRowsNumber){
			//Общее количество строк на данный момент
			var fieldBlocksLen = $('#' + id + 'ddMultipleField .ddFieldBlock').length;
			
			//Проверяем превышает ли уже количество строк максимальное
			if (
				_this.instances[id].maxRowsNumber &&
				fieldBlocksLen >= _this.instances[id].maxRowsNumber
			){
				return;
			//Если будет равно максимуму при создании этого поля
			}else if (
				_this.instances[id].maxRowsNumber &&
				fieldBlocksLen + 1 == _this.instances[id].maxRowsNumber
			){
				_this.instances[id].$addButton.attr('disabled', true);
			}
		}
		
		var $fieldBlock = $('<tr class="ddFieldBlock ' + id + 'ddFieldBlock"><td class="ddSortHandle"><div></div></td></tr>').appendTo($('#' + id + 'ddMultipleField'));
		
		//Разбиваем переданное значение на колонки
		val = val.split(_this.instances[id].colDelimiter);
		
		var $field;
		
		//Перебираем колонки
		$.each(_this.instances[id].columns, function(key){
			if (!val[key]){val[key] = '';}
			if (!_this.instances[id].columnsTitles[key]){_this.instances[id].columnsTitles[key] = '';}
			if (!_this.instances[id].columnsWidth[key] || _this.instances[id].columnsWidth[key] == ''){_this.instances[id].columnsWidth[key] = _this.instances[id].columnsWidth[key - 1];}
			
			var $col = _this.makeFieldCol($fieldBlock);
			
			//Если текущая колонка является изображением
			if(_this.instances[id].columns[key] == 'image'){
				$field = _this.makeText(val[key], _this.instances[id].columnsTitles[key], _this.instances[id].columnsWidth[key], $col);
				
				_this.makeImage(id, $col);
				
				//Create Attach browse button
				$('<input class="ddAttachButton" type="button" value="Вставить" />').insertAfter($field).on('click', function(){
					_this.instances[id].currentField = $(this).siblings('.ddField');
					BrowseServer(id);
				});
			//Если текущая колонка является файлом
			}else if(_this.instances[id].columns[key] == 'file'){
				$field = _this.makeText(val[key], _this.instances[id].columnsTitles[key], _this.instances[id].columnsWidth[key], $col);
				
				//Create Attach browse button
				$('<input class="ddAttachButton" type="button" value="Вставить" />').insertAfter($field).on('click', function(){
					_this.instances[id].currentField = $(this).siblings('.ddField');
					BrowseFileServer(id);
				});	
			//Если id
			}else if (_this.instances[id].columns[key] == 'id'){
				$field = _this.makeText(val[key], '', 0, $col);
				
				if (!($field.val())){
					$field.val((new Date).getTime());
				}
				
				$col.hide();
			//Если селект
			}else if(_this.instances[id].columns[key] == 'select'){
				_this.makeSelect(val[key], _this.instances[id].columnsTitles[key], _this.instances[id].columnsData[key], _this.instances[id].columnsWidth[key], $col);
			//Если дата
			}else if(_this.instances[id].columns[key] == 'date'){
				_this.makeDate(val[key], _this.instances[id].columnsTitles[key], $col);
			//Если textarea
			}else if(_this.instances[id].columns[key] == 'textarea'){
				_this.makeTextarea(val[key], _this.instances[id].columnsTitles[key], _this.instances[id].columnsWidth[key], $col);
			//Если richtext
			}else if(_this.instances[id].columns[key] == 'richtext'){
				_this.makeRichtext(val[key], _this.instances[id].columnsTitles[key], _this.instances[id].columnsWidth[key], $col);
			//По дефолту делаем текстовое поле
			}else{
				_this.makeText(val[key], _this.instances[id].columnsTitles[key], _this.instances[id].columnsWidth[key], $col);
			}
		});
		
		//Create DeleteButton
		_this.makeDeleteButton(id, _this.makeFieldCol($fieldBlock));
		
		//Специально для полей, содержащих изображения необходимо инициализировать
		$('.ddFieldCol:has(.ddField_image) .ddField', $fieldBlock).trigger('change.ddEvents');
		
		return $fieldBlock;
	},
	
	/**
	 * @method makeFieldCol
	 * @version 1.0 (2014-10-23)
	 * 
	 * @desc Создание колонки поля.
	 * 
	 * @param $fieldRow {jQuery} — Target container.
	 * 
	 * @returns {jQuery}
	 */
	makeFieldCol: function($fieldRow){
		return $('<td class="ddFieldCol"></td>').appendTo($fieldRow);
	},
	
	/**
	 * @method makeDeleteButton
	 * @version 1.0.1 (2016-11-16)
	 * 
	 * @desc Makes delete button.
	 * 
	 * @param id {string} — TV id.
	 * @param $fieldCol {jQuery} — Target container.
	 * 
	 * @returns {void}
	 */
	makeDeleteButton: function(id, $fieldCol){
		var _this = this;
		
		$('<input class="ddDeleteButton" type="button" value="×" />').appendTo($fieldCol).on('click', function(){
			//Проверяем на минимальное количество строк
			if (
				_this.instances[id].minRowsNumber &&
				$('#' + id + 'ddMultipleField .ddFieldBlock').length <= _this.instances[id].minRowsNumber
			){
				return;
			}
			
			var $this = $(this),
				$par = $this.parents('.ddFieldBlock:first')/*,
				$table = $this.parents('.ddMultipleField:first')*/;
			
			//Отчистим значения полей
			$par.find('.ddField').val('');
			
			//Если больше одной строки, то можно удалить текущую строчку
			if ($par.siblings('.ddFieldBlock').length > 0){
				$par.fadeOut(300, function(){
					//Если контейнер имеет кнопку добалвения, перенесём её
					if ($par.find('.ddAddButton').length > 0){
						_this.moveAddButton(id, $par.prev('.ddFieldBlock'));
					}
					
					//Сносим
					$par.remove();
					
					//При любом удалении показываем кнопку добавления
					_this.instances[id].$addButton.removeAttr('disabled');
					
					return;
				});
			}
		});
	},
	
	/**
	 * @method makeAddButton
	 * @version 1.0 (2014-10-23)
	 * 
	 * @desc Функция создания кнопки +, вызывается при инициализации.
	 * 
	 * @param id {string} — TV id.
	 * 
	 * @returns {jQuery}
	 */
	makeAddButton: function(id){
		var _this = this;
		
		return $('<input class=\"ddAddButton\" type=\"button\" value=\"+\" />').on('click', function(){
			//Вешаем на кнопку создание новой строки
			$(this).appendTo(_this.makeFieldRow(id, '').find('.ddFieldCol:last'));
		});
	},
	
	/**
	 * @method moveAddButton
	 * @version 1.0 (2014-10-23)
	 * 
	 * @desc Перемещение кнопки.
	 * 
	 * @param id {string} — TV id.
	 * @param $target {string} — Target container.
	 * 
	 * @returns {void}
	 */
	moveAddButton: function(id, $target){
		var _this = this;
		
		//Если не передали, куда вставлять, вставляем в самый конец
		if (!$target){
			$target = $('#' + id + 'ddMultipleField .ddFieldBlock:last');
		}
		
		//Находим кнопку добавления и переносим куда надо
		_this.instances[id].$addButton.appendTo($target.find('.ddFieldCol:last'));
	},
	
	/**
	 * @method makeText
	 * @version 1.0 (2014-10-23)
	 * 
	 * @desc Make text field.
	 * 
	 * @param value {string} — Field value.
	 * @param title {string} — Field title.
	 * @param width {integer} — Field width.
	 * @param $fieldCol {jQuery} — Target container.
	 * 
	 * @returns {jQuery}
	 */
	makeText: function(value, title, width, $fieldCol){
		var $field = $('<input type="text" title="' + title + '" style="width:' + width + 'px;" class="ddField" />');
		
		return $field.val(value).appendTo($fieldCol);
	},
	
	/**
	 * @method makeDate
	 * @version 1.0 (2014-10-23)
	 * 
	 * @desc Make date field.
	 * 
	 * @param value {string} — Field value.
	 * @param title {string} — Field title.
	 * @param $fieldCol {jQuery} — Target container.
	 * 
	 * @returns {jQuery}
	 */
	makeDate: function(value, title, $fieldCol){
		//name нужен для DatePicker`а
		var $field = $('<input type="text" title="' + title + '" class="ddField DatePicker" name="ddMultipleDate" />').val(value).appendTo($fieldCol);
		
		new DatePicker($field.get(0), {
			'yearOffset': $.ddMM.config.datepicker_offset,
			'format': $.ddMM.config.datetime_format + ' hh:mm:00'
		});
		
		return $field;
	},
	
	/**
	 * @method makeTextarea
	 * @version 1.0 (2014-10-23)
	 * 
	 * @desc Make textarea field.
	 * 
	 * @param value {string} — Field value.
	 * @param title {string} — Field title.
	 * @param width {integer} — Field width.
	 * @param $fieldCol {jQuery} — Target container.
	 * 
	 * @returns {jQuery}
	 */
	makeTextarea: function(value, title, width, $fieldCol){
		return $('<textarea title="' + title + '" style="width:' + width + 'px;" class="ddField">' + value + '</textarea>').appendTo($fieldCol);
	},
	
	/**
	 * @method makeRichtext
	 * @version 1.0 (2014-10-23)
	 * 
	 * @desc Make richtext field.
	 * 
	 * @param value {string} — Field value.
	 * @param title {string} — Field title.
	 * @param width {integer} — Field width.
	 * @param $fieldCol {jQuery} — Target container.
	 * 
	 * @returns {jQuery}
	 */
	makeRichtext: function(value, title, width, $fieldCol){
		var _this = this,
			$field = $('<div title="' + title + '" style="width:' + width + 'px;" class="ddField">' + value + '</div>').appendTo($fieldCol);
		
		$('<div class="ddFieldCol_edit"><a class="false" href="#">' + $.ddMM.lang.edit + '</a></div>').appendTo($fieldCol).find('a').on('click', function(event){
			_this.richtextWindow = window.open($.ddMM.config.site_url + $.ddMM.urls.mm + 'widgets/ddmultiplefields/richtext/index.php', 'mm_ddMultipleFields_richtext', new Array(
				'width=600',
				'height=550',
				'left=' + (($.ddTools.windowWidth - 600) / 2),
				'top=' + (($.ddTools.windowHeight - 550) / 2),
				'menubar=no',
				'toolbar=no',
				'location=no',
				'status=no',
				'resizable=no',
				'scrollbars=yes'
			).join(','));
			
			if (_this.richtextWindow != null){
				_this.richtextWindow.$ddField = $field;
			}
			
			event.preventDefault();
		});
		
		return $field;
	},
	
	/**
	 * @method makeImage
	 * @version 1.0.1 (2016-11-16)
	 * 
	 * @desc Make image field.
	 * 
	 * @param id {string} — TV id.
	 * @param $fieldCol {jQuery} — Target container.
	 * 
	 * @returns {void}
	 */
	makeImage: function(id, $fieldCol){
		var _this = this;
		
		// Create a new preview and Attach a browse event to the picture, so it can trigger too
		$('<div class="ddField_image"><img src="" style="' + _this.instances[id].previewStyle + '" /></div>').appendTo($fieldCol).hide().find('img').on('click', function(){
			$fieldCol.find('.ddAttachButton').trigger('click');
		}).on('load.ddEvents', function(){
			//Удаление дерьма, блеать (превьюшка, оставленная от виджета showimagetvs)
			$('#' + id + 'PreviewContainer').remove();
		});
		
		//Находим поле, привязываем события
		$('.ddField', $fieldCol).on('change.ddEvents load.ddEvents', function(){
			var $this = $(this), url = $this.val();
			
			url = (url != '' && url.search(/http:\/\//i) == -1) ? ($.ddMM.config.site_url + url) : url;
			
			//If field not empty
			if (url != ''){
				//Show preview
				$this.siblings('.ddField_image').show().find('img').attr('src', url);
			}else{
				//Hide preview
				$this.siblings('.ddField_image').hide();
			}
		});
	},
	
	/**
	 * @method makeSelect
	 * @version 1.0 (2014-10-23)
	 * 
	 * @desc Функция создания списка.
	 * 
	 * @param value {string} — Field value.
	 * @param title {string} — Field title.
	 * @param [data] {string_JSON} — Field data.
	 * @param data[i] {array} — Item.
	 * @param data[i][0] {string} — Item value.
	 * @param [data[i][1]=data[i][0]] {string} — Item title.
	 * @param width {integer} — Field width.
	 * @param $fieldCol {jQuery} — Target container.
	 * 
	 * @returns {jQuery}
	 */
	makeSelect: function(value, title, data, width, $fieldCol){
		var $select = $('<select class="ddField">');
		
		if (data){
			var dataMas = $.parseJSON(data),
				options = '';
			
			$.each(dataMas, function(index){
				options += '<option value="'+ dataMas[index][0] +'">' + (dataMas[index][1] ? dataMas[index][1] : dataMas[index][0]) +'</option>';
			});
			
			$select.append(options);
		}
		
		if (value){$select.val(value);}
		
		return $select.appendTo($fieldCol);
	},
	
	/**
	 * @method makeNull
	 * @version 1.0 (2014-10-23)
	 * 
	 * @desc Функция ничего не делает.
	 * 
	 * @param id {string} — TV id.
	 * @param $fieldCol {jQuery} — Target container.
	 * 
	 * @returns {false}
	 */
	makeNull: function(id, $fieldCol){return false;}
};

/**
 * jQuery.fn.mm_ddMultipleFields
 * @version 2.0 (2016-11-16)
 * 
 * @desc Делает мультиполя.
 * 
 * @param params {object_plain} — The parameters.
 * @param params.rowDelimiter {string} — Разделитель строк. Default: '||'.
 * @param params.colDelimiter {string} — Разделитель колонок. Default: '::'.
 * @param params.columns {string_commaSeparated|array} — Колонки. Default: 'field'.
 * @param params.columnsTitles {string_commaSeparated|array} — Заголовки колонок. Default: ''.
 * @param params.columnsData {separated string|array} — Данные колонок. Default: ''.
 * @param params.columnsWidth {string_commaSeparated} — Ширины колонок. Default: '180'.
 * @param params.previewStyle {string} — Стиль превьюшек. Default: ''.
 * @param params.minRowsNumber {integer} — Минимальное количество строк. Default: 0.
 * @param params.maxRowsNumber {integer} — Максимальное количество строк. Default: 0.
 * 
 * @copyright 2013–2014 [DivanDesign]{@link http://www.DivanDesign.biz }
 */
$.fn.mm_ddMultipleFields = function(params){
	var _this = $.ddMM.mm_ddMultipleFields;
	
	//Обрабатываем параметры
	params = $.extend({}, _this.defaults, params || {});
	
	params.columns = $.ddMM.makeArray(params.columns);
	params.columnsTitles = $.ddMM.makeArray(params.columnsTitles);
	params.columnsData = $.ddMM.makeArray(params.columnsData, '\\|\\|');
	params.columnsWidth = $.ddMM.makeArray(params.columnsWidth);
	params.minRowsNumber = parseInt(params.minRowsNumber, 10);
	params.maxRowsNumber = parseInt(params.maxRowsNumber, 10);
	
	return $(this).each(function(){
		//Attach new load event
		$(this).on('load.ddEvents', function(event){
			//Оригинальное поле
			var $this = $(this),
				//id оригинального поля
				id = $this.attr('id');
			
			//Проверим на существование (возникали какие-то непонятные варианты, при которых два раза вызов был)
			if (!_this.instances[id]){
				//Инициализация текущего объекта с правилами
				_this.instances[id] = $.extend({}, params);
				
				//Скрываем оригинальное поле
				$this.removeClass('imageField').off('.mm_widget_showimagetvs').addClass('originalField').hide();
				
				//Назначаем обработчик события при изменении (необходимо для того, чтобы после загрузки фотки адрес вставлялся в нужное место)
				$this.on('change.ddEvents', function(){
					//Обновляем текущее мульти-поле
					_this.updateField($this.attr('id'));
				});
				
				//Если это файл или изображение, cкрываем оригинальную кнопку
				$this.next('input[type=button]').hide();
				
				//Создаём мульти-поле
				_this.init(id, $this.val(), $this.parent());
			}
		}).trigger('load');
	});
};

//On document.ready
$(function(){
	if (typeof(SetUrl) == 'undefined'){
		lastImageCtrl = '';
		lastFileCtrl = '';
		
		OpenServerBrowser = function(url, width, height){
			var iLeft = (screen.width - width) / 2,
				iTop = (screen.height - height) / 2;
			
			var sOptions = 'toolbar=no,status=no,resizable=yes,dependent=yes';
			
			sOptions += ',width=' + width;
			sOptions += ',height=' + height;
			sOptions += ',left=' + iLeft;
			sOptions += ',top=' + iTop;
			
			window.open(url, 'FCKBrowseWindow', sOptions);
		};
		
		BrowseServer = function(ctrl){
			lastImageCtrl = ctrl;
			
			var w = screen.width * 0.5;
			var h = screen.height * 0.5;
			
			OpenServerBrowser($.ddMM.urls.manager + 'media/browser/mcpuk/browser.php?Type=images', w, h);
		};
		
		BrowseFileServer = function(ctrl){
			lastFileCtrl = ctrl;
			
			var w = screen.width * 0.5;
			var h = screen.height * 0.5;
			
			OpenServerBrowser($.ddMM.urls.manager + 'media/browser/mcpuk/browser.php?Type=files', w, h);
		};
		
		SetUrlChange = function(el){
			if ('createEvent' in document){
				var evt = document.createEvent('HTMLEvents');
				
				evt.initEvent('change', false, true);
				el.dispatchEvent(evt);
			}else{
				el.fireEvent('onchange');
			}
		};
		
		SetUrl = function(url, width, height, alt){
			if(lastFileCtrl){
				var c = document.getElementById(lastFileCtrl);
				
				if(c && c.value != url){
					c.value = url;
					SetUrlChange(c);
				}
				
				lastFileCtrl = '';
			}else if(lastImageCtrl){
				var c = document.getElementById(lastImageCtrl);
				
				if(c && c.value != url){
					c.value = url;
					SetUrlChange(c);
				}
				
				lastImageCtrl = '';
			}else{
				return;
			}
		};
	}else{
		//For old MODX versions
		if (typeof(SetUrlChange) == 'undefined'){
			//Copy the existing Image browser SetUrl function
			var oldSetUrl = SetUrl;
			
			//Redefine it to also tell the preview to update
			SetUrl = function(url, width, height, alt){
				var $field = $();
				
				if(lastFileCtrl){
					$field = $(document.mutate[lastFileCtrl]);
				}else if(lastImageCtrl){
					$field = $(document.mutate[lastImageCtrl]);
				}
				
				oldSetUrl(url, width, height, alt);
				
				$field.trigger('change');
			};
		}
	}
	
	//Сабмит главной формы
	$.ddMM.$mutate.on('submit', function(){
		$.each($.ddMM.mm_ddMultipleFields.instances, function(key){
			$.ddMM.mm_ddMultipleFields.updateTv(key);
		});
	});
});
})(jQuery);