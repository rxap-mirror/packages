import { ParsedElement } from '@rxap/xml-parser';
import {
  ElementDef,
  ElementAttribute,
  ElementRequired,
  ElementChildTextContent
} from '@rxap/xml-parser/decorators';
import {
  ThemePalette,
  IconConfig,
  SvgIcon,
  MaterialIcon,
  DeleteUndefinedProperties
} from '@rxap/utilities';

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
      inline:    this.inline,
      color:     this.color,
      size:      this.size,
      tooltip:   this.tooltip,
      fontColor: this.fontColor
    };
    if (this.svg) {
      (icon as SvgIcon).svgIcon  = this.name;
      (icon as SvgIcon).fontSet  = this.fontSet;
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
