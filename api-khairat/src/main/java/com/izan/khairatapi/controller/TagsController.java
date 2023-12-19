package com.izan.khairatapi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.izan.khairatapi.entity.Tag;
import com.izan.khairatapi.repository.TagRepository;

@Controller
@RequestMapping("${deploy.url}")
public class TagsController {

    @Autowired
    private TagRepository tagRepository;

    @GetMapping("/tags/findAll")
    @ResponseBody
    public Page<Tag> findAll(@RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sort", defaultValue = "name") String sort,
            @RequestParam(name = "direction", defaultValue = "ASC") String direction) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.Direction.fromString(direction), sort);
        return tagRepository.findAll(pageable);
    }

    @PostMapping("/tags/save")
    @ResponseBody
    public Tag save(@RequestBody Tag tag) {
        return tagRepository.save(tag);
    }

    @DeleteMapping("/tags/delete/{id}")
    @ResponseBody
    public void delete(@PathVariable Long id) {
        tagRepository.deleteById(id);
    }
}
