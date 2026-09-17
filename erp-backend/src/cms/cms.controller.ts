import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

import { CmsService } from './cms.service';

@UseGuards(
  AuthGuard('jwt'),
  PermissionsGuard,
)
@Controller('cms')
export class CmsController {
  constructor(
    private readonly cmsService: CmsService,
  ) {}

  // =====================================================
  // WEBSITE PAGES
  // =====================================================

  @Post('pages')
  @RequirePermissions('cms.manage')
  createPage(@Body() data: any) {
    return this.cmsService.createPage(data);
  }

  @Get('pages')
  @RequirePermissions('cms.read')
  findAllPages() {
    return this.cmsService.findAllPages();
  }

  @Get('pages/:id')
  @RequirePermissions('cms.read')
  findPage(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.cmsService.findPage(id);
  }

  @Patch('pages/:id')
  @RequirePermissions('cms.manage')
  updatePage(
    @Param('id', ParseIntPipe)
    id: number,
    @Body() data: any,
  ) {
    return this.cmsService.updatePage(
      id,
      data,
    );
  }

  @Delete('pages/:id')
  @RequirePermissions('cms.manage')
  deletePage(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.cmsService.deletePage(id);
  }

  // =====================================================
  // BLOGS
  // =====================================================

  @Post('blogs')
  @RequirePermissions('cms.manage')
  createBlog(@Body() data: any) {
    return this.cmsService.createBlog(data);
  }

  @Get('blogs')
  @RequirePermissions('cms.read')
  findAllBlogs() {
    return this.cmsService.findAllBlogs();
  }

  @Get('blogs/:id')
  @RequirePermissions('cms.read')
  findBlog(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.cmsService.findBlog(id);
  }

  @Patch('blogs/:id')
  @RequirePermissions('cms.manage')
  updateBlog(
    @Param('id', ParseIntPipe)
    id: number,
    @Body() data: any,
  ) {
    return this.cmsService.updateBlog(
      id,
      data,
    );
  }

  @Delete('blogs/:id')
  @RequirePermissions('cms.manage')
  deleteBlog(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.cmsService.deleteBlog(id);
  }

  // =====================================================
  // EVENTS
  // =====================================================

  @Post('events')
  @RequirePermissions('cms.manage')
  createEvent(@Body() data: any) {
    return this.cmsService.createEvent(data);
  }

  @Get('events')
  @RequirePermissions('cms.read')
  findAllEvents() {
    return this.cmsService.findAllEvents();
  }

  @Get('events/:id')
  @RequirePermissions('cms.read')
  findEvent(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.cmsService.findEvent(id);
  }

  @Patch('events/:id')
  @RequirePermissions('cms.manage')
  updateEvent(
    @Param('id', ParseIntPipe)
    id: number,
    @Body() data: any,
  ) {
    return this.cmsService.updateEvent(
      id,
      data,
    );
  }

  @Delete('events/:id')
  @RequirePermissions('cms.manage')
  deleteEvent(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.cmsService.deleteEvent(id);
  }

  // =====================================================
  // FAQs
  // =====================================================

  @Post('faqs')
  @RequirePermissions('cms.manage')
  createFaq(@Body() data: any) {
    return this.cmsService.createFaq(data);
  }

  @Get('faqs')
  @RequirePermissions('cms.read')
  findAllFaqs() {
    return this.cmsService.findAllFaqs();
  }

  @Get('faqs/:id')
  @RequirePermissions('cms.read')
  findFaq(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.cmsService.findFaq(id);
  }

  @Patch('faqs/:id')
  @RequirePermissions('cms.manage')
  updateFaq(
    @Param('id', ParseIntPipe)
    id: number,
    @Body() data: any,
  ) {
    return this.cmsService.updateFaq(
      id,
      data,
    );
  }

  @Delete('faqs/:id')
  @RequirePermissions('cms.manage')
  deleteFaq(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.cmsService.deleteFaq(id);
  }

  // =====================================================
  // TEAM MEMBERS
  // =====================================================

  @Post('team')
  @RequirePermissions('cms.manage')
  createTeamMember(@Body() data: any) {
    return this.cmsService.createTeamMember(
      data,
    );
  }

  @Get('team')
  @RequirePermissions('cms.read')
  findAllTeamMembers() {
    return this.cmsService.findAllTeamMembers();
  }

  @Get('team/:id')
  @RequirePermissions('cms.read')
  findTeamMember(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.cmsService.findTeamMember(id);
  }

  @Patch('team/:id')
  @RequirePermissions('cms.manage')
  updateTeamMember(
    @Param('id', ParseIntPipe)
    id: number,
    @Body() data: any,
  ) {
    return this.cmsService.updateTeamMember(
      id,
      data,
    );
  }

  @Delete('team/:id')
  @RequirePermissions('cms.manage')
  deleteTeamMember(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.cmsService.deleteTeamMember(id);
  }
}