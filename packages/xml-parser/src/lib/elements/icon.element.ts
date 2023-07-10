import {
  DeleteUndefinedProperties,
  IconConfig,
  MaterialIcon,
  SvgIcon,
  ThemePalette,
} from '@rxap/utilities';
import { ParsedElement } from './parsed-element';
import { ElementDef } from '../decorators/element-def';
import { ElementAttribute } from '../decorators/element-attribute';
import { ElementChildTextContent } from '../decorators/element-child-text-content';
import { ElementRequired } from '../decorators/mixins/required-element.parser.mixin';

/**
 *
 * ## Examples
 *
 * ### Svg icon
 *
 * ```xml
 * <icon svg="true">
 *   <name>icon_name</name>
 *   <color>warn</color>
 *   <size>10px</size>
 *   <tooltip>tooltip</tooltip>
 *   <font-color>green</font-color>
 *   <font-set>font_set</font-set>
 *   <font-icon>font_icon</font-icon>
 * </icon>
 * ```
 *
 * ### Material icon
 *
 * ```xml
 * <icon>
 *   <name>icon_name</name>
 *   <color>warn</color>
 *   <size>10px</size>
 *   <tooltip>tooltip</tooltip>
 *   <font-color>green</font-color>
 * </icon>
 * ```
 *
 */
@ElementDef('icon')
export class IconElement implements ParsedElement<IconConfig> {

  @ElementAttribute()
  public svg?: boolean;

  @ElementAttribute()
  public inline?: boolean;

  @ElementChildTextContent()
  public color?: ThemePalette;

  @ElementChildTextContent()
  public size?: string;

  @ElementChildTextContent()
  public tooltip?: string;

  @ElementChildTextContent()
  public fontColor?: string;

  @ElementChildTextContent()
  public fontSet?: string;

  @ElementChildTextContent()
  public fontIcon?: string;

  @ElementChildTextContent()
  @ElementRequired()
  public name!: string;

  public getIconConfig(): IconConfig {
    const icon: Partial<IconConfig> = {
      inline: this.inline,
      color: this.color,
      size: this.size,
      tooltip: this.tooltip,
      fontColor: this.fontColor,
    };
    if (this.svg) {
      (icon as SvgIcon).svgIcon = this.name;
      (icon as SvgIcon).fontSet = this.fontSet;
      (icon as SvgIcon).fontIcon = this.fontIcon;
    } else {
      (icon as MaterialIcon).icon = this.name;
    }
    return DeleteUndefinedProperties(icon) as IconConfig;
  }

  public toValue(): IconConfig {
    return this.getIconConfig();
  }

}
