/**
 * jQuery Tree Table Extension
 * 树形表格扩展插件 - 为 jquery.table.js 添加树形展开/收起功能
 * 
 * Author: Joe
 */
(function ($) {

    /**
     * 树形表格构建器
     */
    $.fn.treeTable = function (options) {
        var defaults = {
            idField: 'id',
            parentIdField: 'parentId',
            treeField: 'name',
            expandLevel: 1,  // 默认展开层级，0表示全部折叠，-1表示全部展开
            indent: 20,      // 缩进像素
            expandIcon: 'fa-angle-right',  // 折叠状态图标
            collapseIcon: 'fa-angle-down'  // 展开状态图标
        };

        var settings = $.extend({}, defaults, options);
        var $table = $(this);
        var currentData = null;  // 保存当前数据
        var currentConfig = null;  // 保存当前配置
        var currentTreeData = null;  // 保存当前树形数据

        /**
         * 构建树形结构
         */
        function buildTree(data) {
            var map = {};
            var roots = [];

            // 创建映射
            $.each(data, function (i, item) {
                item._level = 0;
                item._children = [];
                item._parent = null;
                item._expanded = false;
                item._hasChildren = false;
                // 将 ID 转换为字符串作为 map 的键,确保类型一致
                var itemId = String(item[settings.idField]);
                map[itemId] = item;
            });

            // 建立父子关系
            $.each(data, function (i, item) {
                var parentId = item[settings.parentIdField];

                // 处理 parentId 为 null、undefined、0、"0" 的情况,都视为根节点
                if (parentId && parentId != 0 && parentId != '0' && parentId != null && parentId != undefined) {
                    // 将 parentId 也转换为字符串
                    var parentIdStr = String(parentId);

                    if (map[parentIdStr]) {
                        item._parent = map[parentIdStr];
                        map[parentIdStr]._children.push(item);
                    } else {
                        roots.push(item);
                    }
                } else {
                    roots.push(item);
                }
            });

            // 递归计算层级(从根节点开始)
            function calculateLevels(items, level) {
                $.each(items, function (i, item) {
                    item._level = level;
                    if (item._children.length > 0) {
                        calculateLevels(item._children, level + 1);
                    }
                });
            }
            calculateLevels(roots, 0);

            // 设置初始展开状态和 _hasChildren 属性
            function setExpandState(items, level) {
                $.each(items, function (i, item) {
                    // 根据子节点数量设置 _hasChildren
                    if (item._children && item._children.length > 0) {
                        item._hasChildren = true;
                    }

                    // 设置展开状态
                    if (settings.expandLevel == -1 || level < settings.expandLevel) {
                        item._expanded = true;
                    }

                    // 递归处理子节点
                    if (item._children.length > 0) {
                        setExpandState(item._children, level + 1);
                    }
                });
            }
            setExpandState(roots, 0);
            return roots;
        }

        /**
         * 将树形结构转换为扁平列表（用于渲染）
         */
        function flattenTree(roots) {
            var result = [];

            function traverse(items) {
                $.each(items, function (i, item) {
                    result.push(item);
                    // 只有当节点展开时才遍历其子节点
                    if (item._expanded && item._children && item._children.length > 0) {
                        traverse(item._children);
                    }
                });
            }

            traverse(roots);
            return result;
        }

        /**
         * 渲染树形行
         */
        function renderTreeRow(item, index, columns, checkbox, indexCol, operate) {
            var $tr = $('<tr></tr>');
            $tr.attr('data-id', item[settings.idField]);
            $tr.attr('data-level', item._level);
            $tr.attr('data-parent-id', item[settings.parentIdField] || 0);

            if (!item._expanded && item._hasChildren) {
                $tr.addClass('tree-collapsed');
            }

            // 复选框列
            if (!checkbox.hide) {
                var $td = $('<td class="center"></td>');
                $td.html('<label class="pos-rel"><input type="checkbox" class="ace" data-index="' + index + '"/><span class="lbl"></span></label>');
                $tr.append($td);
            }

            // 序号列
            if (!indexCol.hide) {
                var $td = $('<td></td>');
                if (indexCol.align) {
                    $td.addClass('text-' + indexCol.align);
                }
                $td.text(index + 1);
                $tr.append($td);
            }

            // 数据列
            $.each(columns, function (i, column) {
                if (column.hide) {
                    return true;
                }

                var $td = $('<td></td>');

                // 树形字段特殊处理
                if (column.field === settings.treeField) {
                    var indent = item._level * settings.indent;
                    var $content = $('<div style="padding-left: ' + indent + 'px;"></div>');

                    // 添加展开/折叠图标
                    if (item._hasChildren) {
                        var iconClass = item._expanded ? settings.collapseIcon : settings.expandIcon;
                        var $icon = $('<i class="tree-toggle ace-icon fa ' + iconClass + '" style="cursor: pointer; margin-right: 5px;"></i>');
                        $content.append($icon);
                    } else {
                        $content.append('<span style="display: inline-block; width: 16px;"></span>');
                    }

                    // 添加内容
                    if (column.replace) {
                        $content.append(column.replace(item, index, i));
                    } else {
                        $content.append(item[column.field] || '');
                    }

                    $td.append($content);
                } else {
                    // 普通字段
                    if (column.replace) {
                        $td.html(column.replace(item, index, i));
                    } else {
                        $td.html(item[column.field] || '');
                    }
                }

                if (column.align) {
                    $td.addClass('text-' + column.align);
                }
                if (column.clazz) {
                    $td.addClass(column.clazz);
                }
                if (column.mobileHide) {
                    $td.addClass('hidden-480');
                }

                $tr.append($td);
            });

            // 操作列
            if (operate && operate.length > 0) {
                var $td = $('<td></td>');
                renderOperations($td, item, index, operate);
                $tr.append($td);
            }

            return $tr;
        }

        /**
         * 渲染操作按钮
         */
        function renderOperations($cell, data, index, operate) {
            var buttonmParts = [];
            var mdParts = [];

            buttonmParts.push('<div class="hidden-sm hidden-xs action-buttons">');
            mdParts.push('<div class="hidden-md hidden-lg">');
            mdParts.push('<div class="inline pos-rel">');
            mdParts.push('<button class="btn btn-minier btn-yellow dropdown-toggle" data-toggle="dropdown" data-position="auto">');
            mdParts.push('<i class="ace-icon fa fa-caret-down icon-only bigger-120"></i>');
            mdParts.push('</button>');
            mdParts.push('<ul class="dropdown-menu dropdown-only-icon dropdown-yellow dropdown-menu-right dropdown-caret dropdown-close">');

            $.each(operate, function (i, button) {
                var permission = button.permission ? 'permission="' + button.permission + '"' : '';
                var show = button.show ? button.show(data, index) : true;

                if (show) {
                    buttonmParts.push('<a href="javascript:void(0)" class="', button.clazz, '" title="', button.text, '" ', permission, ' data-action="', i, '">');
                    buttonmParts.push('<i class="ace-icon ', button.icon, ' bigger-110"></i>');
                    buttonmParts.push('</a>');

                    mdParts.push('<li>');
                    mdParts.push('<a href="javascript:void(0)" title="', button.text, '" class="tooltip-info" data-rel="tooltip" ', permission, ' data-action="', i, '">');
                    mdParts.push('<span class="', button.clazz, '">');
                    mdParts.push('<i class="ace-icon ', button.icon, ' bigger-110"></i>');
                    mdParts.push('</span>');
                    mdParts.push('</a>');
                    mdParts.push('</li>');
                }
            });

            buttonmParts.push('</div>');
            mdParts.push('</ul></div></div>');

            $cell.html(buttonmParts.join('') + mdParts.join(''));

            // 绑定操作按钮事件
            $cell.find('[data-action]').each(function () {
                var actionIndex = $(this).data('action');
                var button = operate[actionIndex];
                $(this).on('click', function (e) {
                    e.stopPropagation();
                    $('th input[type=checkbox], td input[type=checkbox]').prop('checked', false);
                    $(this).closest('tr').find('td input[type=checkbox]').prop('checked', true);
                    if (button.handler) {
                        button.handler(data, index);
                    }
                });
            });
        }

        /**
         * 切换节点展开/折叠状态
         */
        function toggleNode(item, treeData) {
            item._expanded = !item._expanded;
            return flattenTree(treeData);
        }

        /**
         * 主渲染函数
         * @param {Array} data - 原始数据
         * @param {Object} config - 配置对象
         * @param {Boolean} rebuildTree - 是否重新构建树(默认true),toggle时应该为false
         */
        var renderTreeFunc = function (data, config, rebuildTree) {
            // 默认重新构建树
            if (rebuildTree === undefined) {
                rebuildTree = true;
            }

            // 保存当前数据和配置
            currentData = data;
            currentConfig = config;

            // 只在需要时重新构建树
            if (rebuildTree) {
                currentTreeData = buildTree(data);
            }

            var flatData = flattenTree(currentTreeData);

            var $tbody = $table.find('tbody');
            $tbody.empty();

            if (flatData.length === 0) {
                // 计算正确的列数
                var colspan = 0;
                if (config.checkbox && !config.checkbox.hide) colspan++;
                if (config.index && !config.index.hide) colspan++;

                // 计算可见列数
                $.each(config.columns, function (i, column) {
                    if (!column.hide) {
                        colspan++;
                    }
                });

                if (config.operate && config.operate.length > 0) colspan++;

                $tbody.append('<tr class="odd"><td valign="top" colspan="' + colspan + '" class="dataTables_empty">暂无记录</td></tr>');
                return;
            }

            // 使用 DocumentFragment 批量添加行,减少DOM重排
            var fragment = document.createDocumentFragment();
            $.each(flatData, function (i, item) {
                var $tr = renderTreeRow(
                    item,
                    i,
                    config.columns,
                    config.checkbox || { hide: false },
                    config.index || { hide: true },
                    config.operate || []
                );
                fragment.appendChild($tr[0]);
            });
            $tbody.append(fragment);

            // 绑定复选框全选事件
            $table.find('thead input[type=checkbox]').off('click').on('click', function () {
                var checked = this.checked;
                $tbody.find('input[type=checkbox]').prop('checked', checked);
            });

            // 权限处理
            if (config.after) {
                config.after();
            }
        };

        // 使用事件委托绑定展开/折叠事件（只绑定一次）
        $table.on('click', '.tree-toggle', function (e) {
            e.stopPropagation();
            e.preventDefault();

            var $tr = $(this).closest('tr');
            var id = $tr.data('id');

            // 找到对应的数据项
            var item = null;
            function findItem(items) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i][settings.idField] == id) {
                        item = items[i];
                        return true;
                    }
                    if (items[i]._children.length > 0) {
                        if (findItem(items[i]._children)) {
                            return true;
                        }
                    }
                }
                return false;
            }

            if (currentTreeData) {
                findItem(currentTreeData);

                if (item) {
                    toggleNode(item, currentTreeData);
                    // 重新渲染树形表格,但不重新构建树(保持状态)
                    renderTreeFunc(currentData, currentConfig, false);
                }
            }
        });

        // 将渲染函数绑定到 this
        this.renderTree = renderTreeFunc;

        return this;
    };

})(jQuery);
